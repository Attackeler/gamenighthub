const rawBaseUrl = process.env.EXPO_PUBLIC_FUNCTIONS_URL ?? "";
const baseUrl = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

type QueryParams = Record<string, string | number | undefined>;

const buildUrl = (path: string, params: QueryParams = {}) => {
  const url = new URL(path, baseUrl || undefined);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

export type BggSearchResult = {
  id: number;
  name: string;
  year?: string;
};

export type ImportedGame = {
  bggId: number;
  name: string;
  picture?: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  duration?: string;
  players?: string;
  weight?: number;
  difficulty?: string;
  category?: string;
  categories?: string[];
  lastFetchedAt: number;
};

async function fetchJson<T>(path: string, params: QueryParams = {}): Promise<T> {
  const url = buildUrl(path, params);
  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Request failed (${response.status} ${response.statusText}): ${message}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function searchBoardGames(query: string) {
  if (!query.trim()) {
    return [];
  }

  const data = await fetchJson<{ results: BggSearchResult[] }>(
    "/bggSearch",
    { query },
  );

  return data.results;
}

export async function importBoardGame(bggId: number) {
  if (!bggId) {
    throw new Error("bggId is required");
  }

  const data = await fetchJson<{ game: ImportedGame }>(
    "/bggThing",
    { id: bggId },
  );

  return data.game;
}
