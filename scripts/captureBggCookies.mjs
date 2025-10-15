#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";

const OUTPUT_PATH = path.resolve(".bgg-session.json");
const PROMPT_MESSAGE =
  "\nPlaywright Chrome is open. Log in to BoardGameGeek, make sure you see the browse list, then return here and press ENTER to save the session.\n";
const BROWSE_CAPTURE_URL =
  "https://boardgamegeek.com/browse/boardgame/page/1?sort=rank";

async function promptToContinue() {
  return new Promise((resolve, reject) => {
    process.stdin.setEncoding("utf8");
    process.stdin.resume();

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Prompt timed out while waiting for ENTER (45 minutes)."));
    }, 45 * 60 * 1000);

    const cleanup = () => {
      clearTimeout(timeout);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
    };

    const onData = () => {
      cleanup();
      resolve();
    };

    process.stdin.once("data", onData);
    process.stdout.write(PROMPT_MESSAGE);
  });
}

function extractRelevantHeaders(headers) {
  const allowList = new Set([
    "apollographql-client-name",
    "apollographql-client-version",
    "content-type",
    "x-apollo-cache-control",
    "x-apollo-operation-name",
    "accept",
    "accept-language",
    "accept-encoding",
  ]);

  return Object.fromEntries(
    Object.entries(headers).filter(([key]) => allowList.has(key.toLowerCase())),
  );
}

function isBrowseDataRequest(url) {
  return (
    url.includes("/graphql") ||
    url.includes("/api/browse/boardgame") ||
    url.includes("browse/boardgame?ajax=1")
  );
}

function toTemplate(request) {
  const urlObject = new URL(request.url());
  const method = request.method();
  const headers = extractRelevantHeaders(request.headers());

  if (urlObject.pathname.includes("/graphql")) {
    if (method === "POST") {
      const postData = request.postData();
      if (!postData) return null;
      try {
        const body = JSON.parse(postData);
        return {
          type: "graphql",
          method,
          url: `${urlObject.origin}${urlObject.pathname}`,
          headers,
          body,
        };
      } catch (error) {
        console.warn("Failed to parse GraphQL POST body:", error);
        return null;
      }
    }

    if (method === "GET") {
      const params = Object.fromEntries(urlObject.searchParams.entries());
      let variables = null;

      if (typeof params.variables === "string") {
        try {
          variables = JSON.parse(params.variables);
        } catch (error) {
          console.warn("Failed to parse GraphQL GET variables:", error);
        }
      }

      return {
        type: "graphql",
        method,
        url: `${urlObject.origin}${urlObject.pathname}`,
        headers,
        query: params,
        variables,
      };
    }
  }

  if (
    urlObject.pathname.includes("/api/browse/boardgame") ||
    (urlObject.pathname.includes("/browse/boardgame") &&
      urlObject.searchParams.get("ajax") === "1")
  ) {
    const params = Object.fromEntries(urlObject.searchParams.entries());
    return {
      type: "rest",
      method,
      url: `${urlObject.origin}${urlObject.pathname}`,
      headers,
      query: params,
    };
  }

  return null;
}

async function captureBrowseTemplate(page) {
  let capturedTemplate = null;
  let loggedCount = 0;
  const MAX_LOGGED = 6;

  const tryCapture = (request) => {
    if (capturedTemplate || !isBrowseDataRequest(request.url())) {
      return;
    }

    if (loggedCount < MAX_LOGGED) {
      console.log(
        `[capture] observed ${request.method()} ${request.url()}`,
      );
      loggedCount += 1;
    }

    capturedTemplate = toTemplate(request);

    if (capturedTemplate) {
      console.log(
        `[capture] captured ${capturedTemplate.type?.toUpperCase() ?? "unknown"} template via ${request.method()}`,
      );
    }
  };

  page.on("request", tryCapture);
  page.on("response", (response) => {
    if (!capturedTemplate && isBrowseDataRequest(response.url())) {
      tryCapture(response.request());
    }
  });

  await page.goto(BROWSE_CAPTURE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(4000);

  if (!capturedTemplate) {
    console.warn(
      "Warning: Unable to automatically capture a browse data request. If the page is blank, try scrolling or changing page before pressing ENTER next time.",
    );
  }

  return capturedTemplate;
}

async function saveSession(context, browseTemplate) {
  const storageState = await context.storageState();
  const payload = JSON.stringify(
    {
      storageState,
      browseTemplate,
    },
    null,
    2,
  );

  await fs.writeFile(OUTPUT_PATH, payload, "utf8");
  process.stdout.write(
    `\nSaved session (including browse template if available) to ${OUTPUT_PATH}\n`,
  );
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("https://boardgamegeek.com/login", {
      waitUntil: "domcontentloaded",
    });

    await promptToContinue();

    let browseTemplate = null;
    try {
      browseTemplate = await captureBrowseTemplate(page);
    } catch (error) {
      console.warn("Warning: Failed while capturing browse request:", error);
    }

    await saveSession(context, browseTemplate);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Failed to capture BGG cookies:", error);
  process.exitCode = 1;
});
