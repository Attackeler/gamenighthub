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
exports.bggThing = exports.sendVerificationEmail = exports.bggSearch = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const cors_1 = __importDefault(require("cors"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
admin.initializeApp();
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 2000;
const runtimeConfig = functions.config();
const sendgridConfig = runtimeConfig.sendgrid ?? {};
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? sendgridConfig.key ?? "";
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM ?? sendgridConfig.from ?? "";
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME ?? sendgridConfig.name ?? "Game Night Hub";
if (SENDGRID_API_KEY) {
    mail_1.default.setApiKey(SENDGRID_API_KEY);
}
else {
    functions.logger.warn("SendGrid API key is not configured. sendVerificationEmail will fail until it is set.");
}
const isEmailServiceConfigured = Boolean(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL);
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
function buildVerificationEmailHtml(link, code, email) {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="color:#6C47FF;">Verify your Game Night Hub email</h2>
      <p>Thanks for joining Game Night Hub! Use the code below to verify <strong>${email}</strong>.</p>
      <p style="font-size: 32px; letter-spacing: 4px; font-weight: 700; color:#111827; margin: 16px 0;">
        ${code}
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
async function deliverVerificationEmail(email, link, code) {
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
            `Your verification code is: ${code}`,
            "",
            "You can also verify instantly using this link:",
            link,
            "",
            "If you didn't request this email, you can safely ignore it.",
        ].join("\n"),
        html: buildVerificationEmailHtml(link, code, email),
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
        const code = extractVerificationCode(link);
        await deliverVerificationEmail(targetEmail, link, code);
        res.json({ success: true });
    }
    catch (error) {
        functions.logger.error("sendVerificationEmail failed", error);
        const message = error instanceof Error ? error.message : "Failed to send verification email.";
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