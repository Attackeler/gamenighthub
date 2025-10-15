import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import axios from "axios";
import type { Request, Response } from "express";
import { parseStringPromise } from "xml2js";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });

const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 2000;

type BggThing = Record<string, any>;

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetchXmlWithRetry(
  url: string,
  attempt = 0,
): Promise<any> {
  const response = await axios.get(url, { timeout: 20000 });
  const parsed = await parseStringPromise(response.data);

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

function mapBggThingToDoc(thing: BggThing) {
  const id = Number(thing.$.id);
  const names = thing.name ?? [];
  const primaryName =
    names.find((n: any) => n.$.type === "primary")?.$.value ??
    names[0]?.$.value ??
    "";

  const image =
    thing.image?.[0] ?? thing.thumbnail?.[0] ?? "";

  const ranks =
    thing.statistics?.[0]?.ratings?.[0]?.ranks?.[0]?.rank ?? [];
  const overallRankEntry = ranks.find(
    (rank: any) => rank?.$?.name === "boardgame",
  );
  let rank: number | null = null;
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
  const weight = Number(
    thing.statistics?.[0]?.ratings?.[0]?.averageweight?.[0]?.$.value ?? 0,
  );
  const descriptionRaw = thing.description?.[0] ?? "";
  const description = descriptionRaw
    .replace(/&#10;/g, "\n")
    .replace(/&quot;/g, "\"");

  const categories =
    (thing.link ?? [])
      .filter((link: any) => link.$.type === "boardgamecategory")
      .map((link: any) => link.$.value) ?? [];

  const category = categories[0] ?? "Other";

  const difficulty =
    weight >= 3.25 ? "Hard" :
    weight >= 2.25 ? "Medium" : "Easy";

  const duration =
    minPlaytime && maxPlaytime
      ? `${minPlaytime}–${maxPlaytime} min`
      : minPlaytime
        ? `${minPlaytime} min`
        : "";

  const players =
    minPlayers && maxPlayers
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

function withCors(
  handler: (
    req: Request,
    res: Response,
  ) => Promise<void>,
) {
  return (req: Request, res: Response) => {
    return corsHandler(req, res, () => handler(req, res));
  };
}

export const bggSearch = functions.https.onRequest(
  withCors(async (req, res) => {
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

      const results = items.map((item: any) => ({
        id: Number(item.$.id),
        name: item.name?.[0]?.$.value ?? "",
        year: item.yearpublished?.[0]?.$.value ?? null,
      }));

      res.json({ results });
    } catch (error: any) {
      functions.logger.error("bggSearch failed", error);
      res.status(500).json({ error: error.message ?? "Search failed" });
    }
  }),
);

export const bggThing = functions.https.onRequest(
  withCors(async (req, res) => {
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
        const data = snapshot.data()!;
        if (
          data.lastFetchedAt &&
          now - data.lastFetchedAt < CACHE_TTL_SECONDS
        ) {
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
    } catch (error: any) {
      functions.logger.error("bggThing failed", error);
      res.status(500).json({ error: error.message ?? "Lookup failed" });
    }
  }),
);
