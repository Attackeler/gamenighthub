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

const argv = process.argv.slice(2);

function parseValue(flagName, fallback = null) {
  const flagIndex = argv.findIndex((arg) => arg === flagName);
  if (flagIndex !== -1 && argv[flagIndex + 1]) {
    return argv[flagIndex + 1];
  }

  const inline = argv.find((arg) => arg.startsWith(`${flagName}=`));
  if (inline) {
    return inline.split("=")[1];
  }

  return fallback;
}

const LIMIT = Number(parseValue("--limit", 500));
const START_PAGE = Number(parseValue("--start-page", 1));
const END_PAGE = Number(parseValue("--end-page", Number.POSITIVE_INFINITY));

const ITEMS_PER_PAGE = 100;
const IMPORT_DELAY_MS = 1500;
const RATE_LIMIT_DELAY_MS = 10000;
const MAX_IMPORT_ATTEMPTS = 5;

function loadSessionFile() {
  try {
    const raw = fs.readFileSync(".bgg-session.json", "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.storageState || parsed.browseTemplate) {
      return {
        storageState: parsed.storageState ?? null,
        browseTemplate: parsed.browseTemplate ?? null,
      };
    }
    return { storageState: parsed, browseTemplate: null };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Failed to load .bgg-session.json:", error);
    }
    return { storageState: null, browseTemplate: null };
  }
}

const { storageState, browseTemplate } = loadSessionFile();

function buildCookieHeader(state) {
  const cookies = state?.cookies ?? [];
  const relevantCookies = cookies.filter((cookie) =>
    String(cookie?.domain ?? "").includes("boardgamegeek.com"),
  );

  if (!relevantCookies.length) {
    return null;
  }

  return relevantCookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

const BGG_COOKIE_HEADER = buildCookieHeader(storageState);

if (!BGG_COOKIE_HEADER) {
  console.warn(
    "Proceeding without authenticated BGG cookies. Pages after 10 may fail. Run `node scripts/captureBggCookies.mjs` to save a session.",
  );
}

const DEFAULT_USER_AGENT =
  "GameNightHubImporter/1.0 (+https://gamenight-db.firebaseapp.com)";

const COMMON_HEADERS = {
  "User-Agent": DEFAULT_USER_AGENT,
};

if (BGG_COOKIE_HEADER) {
  COMMON_HEADERS.Cookie = BGG_COOKIE_HEADER;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function normalizeId(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) {
      const numeric = Number(match[0]);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
  }
  return NaN;
}

function extractGameIdsFromPayload(payload) {
  const seen = new Set();
  const ordered = [];

  const stack = [payload];
  while (stack.length > 0) {
    const current = stack.pop();
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i -= 1) {
        stack.push(current[i]);
      }
      continue;
    }

    if (!current || typeof current !== "object") {
      continue;
    }

    const candidate =
      current.id ?? current.objectid ?? current.objectId ?? current.thingId;
    const subtype =
      current.subtype ?? current.objecttype ?? current.type ?? "";

    if (candidate !== undefined) {
      const normalized = normalizeId(candidate);
      const subtypeText = String(subtype).toLowerCase();
      const isBoardgame =
        !subtypeText ||
        subtypeText.includes("boardgame") ||
        subtypeText.includes("thing");

      if (Number.isFinite(normalized) && isBoardgame && !seen.has(normalized)) {
        seen.add(normalized);
        ordered.push(normalized);
      }
    }

    Object.values(current).forEach((value) => {
      if (value && typeof value === "object") {
        stack.push(value);
      }
    });
  }

  return ordered;
}

function derivePageSizeFromVariables(variables) {
  if (!variables || typeof variables !== "object") {
    return ITEMS_PER_PAGE;
  }

  const possibleKeys = [
    "pageSize",
    "pagesize",
    "first",
    "limit",
    "count",
    "take",
    "perPage",
    "page_size",
  ];

  for (const key of possibleKeys) {
    if (!(key in variables)) continue;
    const numeric = Number(variables[key]);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return ITEMS_PER_PAGE;
}

function applyPageVariables(target, page, pageSize) {
  if (!target || typeof target !== "object") {
    return;
  }

  const update = (key, value) => {
    if (key in target) {
      target[key] = value;
    }
  };

  update("page", page);
  update("pageid", page);
  update("pageIndex", page);
  update("page_index", page);

  update("start", (page - 1) * pageSize);
  update("offset", (page - 1) * pageSize);
  update("skip", (page - 1) * pageSize);

  update("first", pageSize);
  update("limit", pageSize);
  update("count", pageSize);
  update("take", pageSize);
  update("pageSize", pageSize);
  update("pagesize", pageSize);
  update("perPage", pageSize);
  update("page_size", pageSize);
}

async function fetchTopGameIdsViaGraphql(template, limit) {
  const method = (template.method ?? "POST").toUpperCase();
  const url = template.url ?? "https://boardgamegeek.com/graphql";
  const headers = { ...(template.headers ?? {}), ...COMMON_HEADERS };

  const ids = new Set();

  if (method === "POST") {
    const baseBody = template.body;
    if (!baseBody?.variables) {
      console.warn("GraphQL template POST body lacks variables. Falling back to HTML scraping.");
      return null;
    }

    const pageSize = derivePageSizeFromVariables(baseBody.variables);

    for (let page = START_PAGE; ids.size < limit && page <= END_PAGE; page += 1) {
      const body = deepClone(baseBody);
      applyPageVariables(body.variables, page, pageSize);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `GraphQL fetch failed on page ${page} (${response.status} ${response.statusText})`,
        );
      }

      const payload = await response.json();
      const pageIds = extractGameIdsFromPayload(payload);
      if (!pageIds.length) {
        console.warn(
          `GraphQL response on page ${page} did not include any game IDs. Stopping.`,
        );
        break;
      }

      pageIds.forEach((id) => ids.add(id));
    }

    return Array.from(ids).slice(0, limit);
  }

  if (method === "GET") {
    const baseQuery = { ...(template.query ?? {}) };
    const baseVariables = template.variables ?? null;
    const pageSize =
      derivePageSizeFromVariables(baseVariables) ??
      derivePageSizeFromVariables(baseQuery);

    for (let page = START_PAGE; ids.size < limit && page <= END_PAGE; page += 1) {
      const queryParams = { ...baseQuery };
      let variables = baseVariables ? deepClone(baseVariables) : null;

      if (variables) {
        applyPageVariables(variables, page, pageSize);
        queryParams.variables = JSON.stringify(variables);
      } else {
        applyPageVariables(queryParams, page, pageSize);
      }

      const urlObject = new URL(url);
      Object.entries(queryParams).forEach(([key, value]) => {
        urlObject.searchParams.set(key, value);
      });

      const response = await fetch(urlObject.toString(), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `GraphQL fetch failed on page ${page} (${response.status} ${response.statusText})`,
        );
      }

      const payload = await response.json();
      const pageIds = extractGameIdsFromPayload(payload);
      if (!pageIds.length) {
        console.warn(
          `GraphQL response on page ${page} did not include any game IDs. Stopping.`,
        );
        break;
      }

      pageIds.forEach((id) => ids.add(id));
    }

    return Array.from(ids).slice(0, limit);
  }

  console.warn(`Unsupported GraphQL template method: ${method}. Falling back to HTML scraping.`);
  return null;
}

async function fetchTopGameIdsViaRest(template, limit) {
  const method = (template.method ?? "GET").toUpperCase();
  const url = template.url ?? "https://boardgamegeek.com/browse/boardgame";
  const headers = { ...(template.headers ?? {}), ...COMMON_HEADERS };

  const baseQuery = { ...(template.query ?? {}) };
  const pageSize = derivePageSizeFromVariables(baseQuery);

  const ids = new Set();

  for (let page = START_PAGE; ids.size < limit && page <= END_PAGE; page += 1) {
    const queryParams = deepClone(baseQuery);
    applyPageVariables(queryParams, page, pageSize);

    const urlObject = new URL(url);
    Object.entries(queryParams).forEach(([key, value]) => {
      urlObject.searchParams.set(key, value);
    });

    let response;
    if (method === "GET") {
      response = await fetch(urlObject.toString(), { method, headers });
    } else if (method === "POST") {
      response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(queryParams),
      });
    } else {
      console.warn(`Unsupported REST method: ${method}. Falling back to HTML scraping.`);
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `REST browse fetch failed on page ${page} (${response.status} ${response.statusText})`,
      );
    }

    const payload = await response.json();
    const pageIds = extractGameIdsFromPayload(payload);
    if (!pageIds.length) {
      console.warn(
        `REST browse response on page ${page} did not include any game IDs. Stopping.`,
      );
      break;
    }

    pageIds.forEach((id) => ids.add(id));
  }

  return Array.from(ids).slice(0, limit);
}

async function fetchTopGameIds(limit) {
  if (browseTemplate) {
    try {
      if (browseTemplate.type === "graphql") {
        const ids = await fetchTopGameIdsViaGraphql(browseTemplate, limit);
        if (ids && ids.length) {
          return ids;
        }
      } else if (browseTemplate.type === "rest") {
        const ids = await fetchTopGameIdsViaRest(browseTemplate, limit);
        if (ids && ids.length) {
          return ids;
        }
      }
    } catch (error) {
      console.warn("Browse template fetch failed. Falling back to HTML:", error);
    }
    console.warn("Browse template did not yield IDs. Falling back to HTML scraping.");
  }

  console.log("Attempting Playwright headless scrape fallback…");
  const playwrightIds = await fetchTopGameIdsViaPlaywright(limit);
  if (playwrightIds && playwrightIds.length) {
    return playwrightIds;
  }

  console.warn(
    "Playwright fallback unavailable. Run `npm install --save-dev @playwright/test` and `npx playwright install chromium` to enable headless scraping.",
  );
  return fetchTopGameIdsViaHtml(limit);
}

async function fetchTopGameIdsViaPlaywright(limit) {
  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND" || /Cannot find package/.test(String(error))) {
      console.warn("Playwright package not installed.");
    } else {
      console.warn("Playwright import failed:", error);
    }
    return null;
  }

  const browser = await chromium.launch({ headless: true });
  let context;
  try {
    context = await browser.newContext(
      storageState ? { storageState } : undefined,
    );
    const page = await context.newPage();

    const ids = new Set();
    for (let pageIndex = START_PAGE; ids.size < limit && pageIndex <= END_PAGE; pageIndex += 1) {
      const url = `https://boardgamegeek.com/browse/boardgame/page/${pageIndex}?sort=rank`;
      console.log(`(Playwright) Loading ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});


      try {
        await page.waitForSelector("a.primary[href*='/boardgame/']", {
          timeout: 15000,
        });
      } catch (error) {
        console.warn(`Playwright: no primary anchors found on page ${pageIndex}. Stopping.`);
        break;
      }

      const pageIds = await page.$$eval(
        "a.primary[href*='/boardgame/']",
        (anchors) => {
          const results = [];
          for (const anchor of anchors) {
            const match = anchor.getAttribute("href")?.match(/\/boardgame\/(\d+)\//);
            if (match) {
              results.push(Number(match[1]));
            }
          }
          return results;
        },
      );

      if (!pageIds.length) {
        console.warn(`Playwright: no IDs extracted on page ${pageIndex}.`);
        continue;
      }

      pageIds.forEach((id) => ids.add(id));
    }

    console.log(`(Playwright) Scraped ${ids.size} unique IDs`);
    return Array.from(ids).slice(0, limit);
  } catch (error) {
    console.warn("Playwright capture failed:", error);
    return null;
  } finally {
    await browser.close();
  }
}

async function fetchTopGameIdsViaHtml(limit) {
  const ids = new Set();
  for (let page = START_PAGE; ids.size < limit; page += 1) {
    if (page > END_PAGE) {
      console.log(
        `Reached configured end page ${END_PAGE}. Stopping at ${ids.size} collected IDs.`,
      );
      break;
    }

    const url = `https://boardgamegeek.com/browse/boardgame/page/${page}?sort=rank`;
    console.log(`Fetching ranking page ${page} -> ${url}`);

    const response = await fetch(url, { headers: COMMON_HEADERS });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch rankings (${response.status} ${response.statusText})`,
      );
    }

    const html = await response.text();
    console.log(`Page ${page} length: ${html.length}`);
    const matches = [...html.matchAll(/boardgame\/(\d+)\//g)];
    if (matches.length === 0) {
      console.warn(
        `No items found on page ${page}. First 200 chars:\n${html.slice(0, 200)}`,
      );
      break;
    }

    const sizeBefore = ids.size;

    matches.forEach((match) => {
      const id = Number(match[1]);
      if (Number.isFinite(id)) {
        ids.add(id);
      }
    });

    if (ids.size === sizeBefore) {
      console.warn(`No new IDs found on page ${page}. Continuing...`);
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
