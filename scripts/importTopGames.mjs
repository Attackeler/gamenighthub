#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) return;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

loadEnv();

const FUNCTIONS_BASE =
  (process.env.EXPO_PUBLIC_FUNCTIONS_URL ?? "").replace(/\/$/, "");

if (!FUNCTIONS_BASE) {
  console.error(
    "Missing EXPO_PUBLIC_FUNCTIONS_URL. Set it in .env before running this script.",
  );
  process.exit(1);
}

const LIMIT = Number(
  process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ??
    500,
);

const ITEMS_PER_PAGE = 100;
const IMPORT_DELAY_MS = 1500;
const RATE_LIMIT_DELAY_MS = 10000;
const MAX_IMPORT_ATTEMPTS = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTopGameIds(limit) {
  const ids = new Set();
  for (let page = 1; ids.size < limit; page += 1) {
    const url = `https://boardgamegeek.com/browse/boardgame/page/${page}`;
    console.log(`Fetching ranking page ${page} -> ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GameNightHubImporter/1.0 (+https://gamenight-db.firebaseapp.com)",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch rankings (${response.status} ${response.statusText})`,
      );
    }

    const html = await response.text();
    console.log(`Page ${page} length: ${html.length}`);
    const matches = [...html.matchAll(/boardgame\/(\d+)\//g)];
    if (matches.length === 0) {
      console.warn(`No items found on page ${page}. First 200 chars:\n${html.slice(0, 200)}`);
      break;
    }

    matches.forEach((match) => {
      const id = Number(match[1]);
      if (Number.isFinite(id)) {
        ids.add(id);
      }
    });

    if (matches.length < ITEMS_PER_PAGE) {
      break;
    }
  }

  return Array.from(ids).slice(0, limit);
}

async function importGame(id) {
  const url = `${FUNCTIONS_BASE}/bggThing?id=${id}`;
  for (let attempt = 1; attempt <= MAX_IMPORT_ATTEMPTS; attempt += 1) {
    const response = await fetch(url);

    if (response.status === 429) {
      const retryAfter = RATE_LIMIT_DELAY_MS * attempt;
      console.warn(
        `Rate limited on #${id} (attempt ${attempt}/${MAX_IMPORT_ATTEMPTS}). Waiting ${retryAfter}ms before retrying.`,
      );
      await sleep(retryAfter);
      continue;
    }

    if (!response.ok) {
      if (attempt === MAX_IMPORT_ATTEMPTS) {
        const text = await response.text();
        throw new Error(`Import failed (${response.status}): ${text}`);
      }
      console.warn(
        `Request failed for #${id} (status ${response.status}) attempt ${attempt}/${MAX_IMPORT_ATTEMPTS}. Retrying in ${RATE_LIMIT_DELAY_MS}ms.`,
      );
      await sleep(RATE_LIMIT_DELAY_MS);
      continue;
    }

    const payload = await response.json();
    return payload.game ?? null;
  }

  throw new Error(`Import failed for #${id} after ${MAX_IMPORT_ATTEMPTS} attempts`);
}

async function main() {
  console.log(`Target: ${LIMIT} games`);

  const ids = await fetchTopGameIds(LIMIT);
  console.log(`Fetched ${ids.length} IDs`);

  let success = 0;
  let failures = 0;

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    try {
      const game = await importGame(id);
      success += 1;
      console.log(
        `[${success}/${ids.length}] Imported #${id} - ${game?.name ?? "?"}`,
      );
    } catch (error) {
      failures += 1;
      console.error(`[${i + 1}/${ids.length}] Failed to import ${id}:`, error);
    }

    await sleep(IMPORT_DELAY_MS);
  }

  console.log(
    `Done. Success: ${success}, Failed: ${failures}. Cached docs live in Firestore /games.`,
  );
}

main().catch((error) => {
  console.error("Import script failed:", error);
  process.exit(1);
});
