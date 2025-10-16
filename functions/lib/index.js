"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bggThing = exports.exchangeVerificationCode = exports.sendVerificationEmail = exports.bggSearch = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const cors_1 = __importDefault(require("cors"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const fs_2 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const firestore_1 = require("firebase-admin/firestore");
function loadEnvFile(fileName) {
    const envPath = path_1.default.resolve(__dirname, "..", fileName);
    if (!(0, fs_1.existsSync)(envPath)) {
        return;
    }
    try {
        const content = (0, fs_1.readFileSync)(envPath, "utf-8");
        for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) {
                continue;
            }
            const equalsIndex = line.indexOf("=");
            if (equalsIndex === -1) {
                continue;
            }
            const key = line.slice(0, equalsIndex).trim();
            if (!key || process.env[key] !== undefined) {
                continue;
            }
            const rawValue = line.slice(equalsIndex + 1).trim();
            const value = rawValue.replace(/^(["'])(.*)\1$/, "$2");
            process.env[key] = value;
        }
        console.info(`Loaded environment variables from ${envPath}`);
    }
    catch (error) {
        console.warn(`Failed to load environment variables from ${envPath}`, error);
    }
}
loadEnvFile(".env.gamenight-db");
const serviceAccountPath = path_1.default.join(__dirname, "../serviceAccountKey.json");
if (fs_2.default.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
else {
    // fallback for Firebase hosting/CI where Application Default Credentials exist
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ??
        path_1.default.resolve(__dirname, "../serviceAccountKey.json");
    if (serviceAccountPath && (0, fs_1.existsSync)(serviceAccountPath)) {
        // Use explicit service account credentials when provided.
        try {
            const raw = (0, fs_1.readFileSync)(serviceAccountPath, "utf-8");
            const serviceAccount = JSON.parse(raw);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        catch (error) {
            console.warn(`Failed to parse service account at ${serviceAccountPath}. Falling back to default credentials.`, error);
            admin.initializeApp();
        }
    }
    else {
        // Fall back to Application Default Credentials (Cloud Functions, etc.).
        admin.initializeApp();
    }
}
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 2000;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? "";
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM ?? "";
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME ?? "Game Night Hub";
const SHORT_CODE_COLLECTION = "emailVerificationCodes";
const SHORT_CODE_LENGTH = 6;
const SHORT_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SHORT_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
if (SENDGRID_API_KEY) {
    mail_1.default.setApiKey(SENDGRID_API_KEY);
}
else {
    functions.logger.warn("SendGrid API key is not configured. sendVerificationEmail will fail until it is set.");
}
const isEmailServiceConfigured = Boolean(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL);
function generateShortCode() {
    const bytes = (0, crypto_1.randomBytes)(SHORT_CODE_LENGTH);
    let code = "";
    for (let i = 0; i < SHORT_CODE_LENGTH; i += 1) {
        const index = bytes[i] % SHORT_CODE_ALPHABET.length;
        code += SHORT_CODE_ALPHABET[index];
    }
    return code;
}
async function createShortVerificationCode(email, oobCode) {
    const collectionRef = db.collection(SHORT_CODE_COLLECTION);
    const now = Date.now();
    const expiresAt = firestore_1.Timestamp.fromMillis(now + SHORT_CODE_TTL_MS);
    const payload = {
        email,
        oobCode,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        expiresAt,
    };
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const shortCode = generateShortCode();
        const docRef = collectionRef.doc(shortCode);
        try {
            await docRef.create(payload);
            // Best effort cleanup of older codes for this email
            try {
                const existing = await collectionRef.where("email", "==", email).get();
                const batch = db.batch();
                existing.docs.forEach((doc) => {
                    if (doc.id !== shortCode) {
                        batch.delete(doc.ref);
                    }
                });
                await batch.commit();
            }
            catch (cleanupError) {
                functions.logger.debug("Failed to cleanup old verification codes", cleanupError);
            }
            return shortCode;
        }
        catch (error) {
            if (error?.code === 6 || error?.code === "ALREADY_EXISTS") {
                continue;
            }
            throw error;
        }
    }
    throw new Error("Failed to generate a verification code. Please try again.");
}
async function resolveShortVerificationCode(shortCodeRaw, expectedEmail) {
    const shortCode = shortCodeRaw.trim().toUpperCase();
    const docRef = db.collection(SHORT_CODE_COLLECTION).doc(shortCode);
    const snap = await docRef.get();
    if (!snap.exists) {
        throw new functions.https.HttpsError("not-found", "Verification code not found.");
    }
    const data = snap.data();
    if (!data?.oobCode || !data?.email) {
        await docRef.delete();
        throw new functions.https.HttpsError("not-found", "Verification code is invalid.");
    }
    if (data.email.toLowerCase() !== expectedEmail.toLowerCase()) {
        throw new functions.https.HttpsError("permission-denied", "Verification code does not belong to this account.");
    }
    const expiresAtMillis = data.expiresAt?.toMillis();
    if (expiresAtMillis && expiresAtMillis < Date.now()) {
        await docRef.delete();
        throw new functions.https.HttpsError("deadline-exceeded", "Verification code expired.");
    }
    await docRef.delete();
    return data.oobCode;
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchXmlWithRetry(url, attempt = 0) {
    const response = await axios_1.default.get(url, { timeout: 20000 });
    const parsed = await (0, xml2js_1.parseStringPromise)(response.data);
    const queuedMessage = parsed.items?.message?.[0];
    if (queuedMessage) {
        if (attempt >= MAX_RETRY_COUNT - 1) {
            throw new Error(`BGG queue timeout: ${queuedMessage}`);
        }
        await delay(RETRY_DELAY_MS);
        return fetchXmlWithRetry(url, attempt + 1);
    }
    return parsed;
}
function mapBggThingToDoc(thing) {
    const id = Number(thing.$.id);
    const names = thing.name ?? [];
    const primaryName = names.find((n) => n.$.type === "primary")?.$.value ??
        names[0]?.$.value ??
        "";
    const image = thing.image?.[0] ?? thing.thumbnail?.[0] ?? "";
    const ranks = thing.statistics?.[0]?.ratings?.[0]?.ranks?.[0]?.rank ?? [];
    const overallRankEntry = ranks.find((rank) => rank?.$?.name === "boardgame");
    let rank = null;
    if (overallRankEntry) {
        const value = overallRankEntry.$?.value;
        const numeric = Number(value);
        rank =
            Number.isFinite(numeric) && numeric > 0
                ? numeric
                : null;
    }
    const minPlayers = Number(thing.minplayers?.[0]?.$.value ?? 0);
    const maxPlayers = Number(thing.maxplayers?.[0]?.$.value ?? 0);
    const minPlaytime = Number(thing.minplaytime?.[0]?.$.value ?? 0);
    const maxPlaytime = Number(thing.maxplaytime?.[0]?.$.value ?? 0);
    const weight = Number(thing.statistics?.[0]?.ratings?.[0]?.averageweight?.[0]?.$.value ?? 0);
    const descriptionRaw = thing.description?.[0] ?? "";
    const description = descriptionRaw
        .replace(/&#10;/g, "\n")
        .replace(/&quot;/g, "\"");
    const categories = (thing.link ?? [])
        .filter((link) => link.$.type === "boardgamecategory")
        .map((link) => link.$.value) ?? [];
    const category = categories[0] ?? "Other";
    const difficulty = weight >= 3.25 ? "Hard" :
        weight >= 2.25 ? "Medium" : "Easy";
    const duration = minPlaytime && maxPlaytime
        ? `${minPlaytime}–${maxPlaytime} min`
        : minPlaytime
            ? `${minPlaytime} min`
            : "";
    const players = minPlayers && maxPlayers
        ? `${minPlayers}-${maxPlayers} Players`
        : minPlayers
            ? `${minPlayers}+ Players`
            : "";
    return {
        bggId: id,
        name: primaryName,
        picture: image,
        description,
        minPlayers,
        maxPlayers,
        minPlaytime,
        maxPlaytime,
        duration,
        players,
        weight,
        difficulty,
        category,
        categories,
        rank,
        lastFetchedAt: Math.floor(Date.now() / 1000),
    };
}
function withCors(handler) {
    return (req, res) => {
        return corsHandler(req, res, () => handler(req, res));
    };
}
exports.bggSearch = functions.https.onRequest(withCors(async (req, res) => {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const query = String(req.query.query ?? "").trim();
    if (!query) {
        res.status(400).json({ error: "query is required" });
        return;
    }
    try {
        const url = `https://boardgamegeek.com/xmlapi2/search?type=boardgame,boardgameexpansion&query=${encodeURIComponent(query)}`;
        const parsed = await fetchXmlWithRetry(url);
        const items = parsed.items?.item ?? [];
        const results = items.map((item) => ({
            id: Number(item.$.id),
            name: item.name?.[0]?.$.value ?? "",
            year: item.yearpublished?.[0]?.$.value ?? null,
        }));
        res.json({ results });
    }
    catch (error) {
        functions.logger.error("bggSearch failed", error);
        res.status(500).json({ error: error.message ?? "Search failed" });
    }
}));
function buildVerificationEmailHtml(link, displayCode, email) {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="color:#6C47FF;">Verify your Game Night Hub email</h2>
      <p>Thanks for joining Game Night Hub! Use the code below to verify <strong>${email}</strong>.</p>
      <p style="font-size: 32px; letter-spacing: 4px; font-weight: 700; color:#111827; margin: 16px 0;">
        ${displayCode}
      </p>
      <p>You can also verify instantly by clicking the button:</p>
      <p>
        <a
          href="${link}"
          style="
            display:inline-block;
            padding:12px 24px;
            background-color:#6C47FF;
            color:#ffffff;
            font-weight:600;
            text-decoration:none;
            border-radius:9999px;
          "
        >
          Verify email
        </a>
      </p>
      <p style="font-size:12px;color:#6B7280;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <span style="word-break: break-all;">${link}</span>
      </p>
      <p style="font-size:12px;color:#9CA3AF;">This code expires soon. Request another from the app if you need a fresh one.</p>
    </div>
  `;
}
async function deliverVerificationEmail(email, link, displayCode) {
    if (!isEmailServiceConfigured) {
        throw new Error("Email service is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM.");
    }
    await mail_1.default.send({
        to: email,
        from: {
            email: SENDGRID_FROM_EMAIL,
            name: SENDGRID_FROM_NAME,
        },
        subject: "Verify your Game Night Hub email",
        text: [
            "Thanks for joining Game Night Hub!",
            `Your verification code is: ${displayCode}`,
            "",
            "You can also verify instantly using this link:",
            link,
            "",
            "If you didn't request this email, you can safely ignore it.",
        ].join("\n"),
        html: buildVerificationEmailHtml(link, displayCode, email),
    });
}
function extractVerificationCode(link) {
    const url = new URL(link);
    const code = url.searchParams.get("oobCode");
    if (!code) {
        throw new Error("Verification link does not contain an oobCode parameter.");
    }
    return code;
}
exports.sendVerificationEmail = functions.https.onRequest(withCors(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    if (!isEmailServiceConfigured) {
        res.status(500).json({
            error: "Email service is not configured. Ask an admin to configure SendGrid.",
        });
        return;
    }
    const authHeader = req.headers.authorization ?? "";
    if (!authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }
    const idToken = authHeader.slice("Bearer ".length).trim();
    if (!idToken) {
        res.status(401).json({ error: "Missing ID token" });
        return;
    }
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const userRecord = await admin.auth().getUser(decoded.uid);
        if (!userRecord.email) {
            res
                .status(400)
                .json({ error: "Authenticated user does not have an email address." });
            return;
        }
        const requestEmail = typeof req.body?.email === "string" ? req.body.email.trim() : "";
        const targetEmail = requestEmail || userRecord.email;
        if (targetEmail.toLowerCase() !== userRecord.email.toLowerCase()) {
            res.status(403).json({
                error: "You can only request verification for your own email address.",
            });
            return;
        }
        const link = await admin
            .auth()
            .generateEmailVerificationLink(targetEmail);
        const oobCode = extractVerificationCode(link);
        const displayCode = await createShortVerificationCode(targetEmail, oobCode);
        await deliverVerificationEmail(targetEmail, link, displayCode);
        res.json({ success: true });
    }
    catch (error) {
        functions.logger.error("sendVerificationEmail failed", error);
        const message = error instanceof Error ? error.message : "Failed to send verification email.";
        res.status(500).json({ error: message });
    }
}));
exports.exchangeVerificationCode = functions.https.onRequest(withCors(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    const authHeader = req.headers.authorization ?? '';
    if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }
    const idToken = authHeader.slice('Bearer '.length).trim();
    if (!idToken) {
        res.status(401).json({ error: 'Missing ID token' });
        return;
    }
    const codeRaw = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    if (!codeRaw) {
        res.status(400).json({ error: 'Verification code is required.' });
        return;
    }
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const userRecord = await admin.auth().getUser(decoded.uid);
        if (!userRecord.email) {
            res.status(400).json({ error: 'Authenticated user does not have an email address.' });
            return;
        }
        let resolvedCode = codeRaw;
        if (codeRaw.length <= 16) {
            resolvedCode = await resolveShortVerificationCode(codeRaw, userRecord.email);
        }
        res.json({ oobCode: resolvedCode });
    }
    catch (error) {
        functions.logger.error('exchangeVerificationCode failed', error);
        if (error instanceof functions.https.HttpsError) {
            const statusMap = {
                'not-found': 404,
                'permission-denied': 403,
                'deadline-exceeded': 410,
            };
            const status = statusMap[error.code] ?? 400;
            res.status(status).json({ error: error.message });
            return;
        }
        const message = error instanceof Error ? error.message : 'Failed to resolve verification code.';
        res.status(500).json({ error: message });
    }
}));
exports.bggThing = functions.https.onRequest(withCors(async (req, res) => {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const id = Number(req.query.id);
    if (!id) {
        res.status(400).json({ error: "id is required" });
        return;
    }
    try {
        const docRef = db.collection("games").doc(String(id));
        const snapshot = await docRef.get();
        const now = Math.floor(Date.now() / 1000);
        if (snapshot.exists) {
            const data = snapshot.data();
            if (data.lastFetchedAt &&
                now - data.lastFetchedAt < CACHE_TTL_SECONDS) {
                res.json({ source: "cache", game: data });
                return;
            }
        }
        const url = `https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`;
        const parsed = await fetchXmlWithRetry(url);
        const thing = parsed.items?.item?.[0];
        if (!thing) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        const doc = mapBggThingToDoc(thing);
        await docRef.set(doc, { merge: true });
        res.json({ source: "bgg", game: doc });
    }
    catch (error) {
        functions.logger.error("bggThing failed", error);
        res.status(500).json({ error: error.message ?? "Lookup failed" });
    }
}));
//# sourceMappingURL=index.js.map