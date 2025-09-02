/**
 * syncService
 * - Fetches Pokémon TCG data and syncs to Supabase
 * - Upserts sets then cards, logs progress in sync_runs
 */
import type { Database, TablesInsert } from "../database.types";
import { getSupabaseClient } from "../lib/supabaseClient";

type CardApi = {
  id: string;
  name: string;
  number?: string;
  images?: { small?: string; large?: string };
  legalities?: unknown;
  rarity?: string;
  set?: { id: string };
  subtypes?: string[];
  supertype?: string;
  tcgplayer?: unknown;
  cardmarket?: unknown;
  types?: string[];
};

type SetApi = {
  id: string;
  name: string;
  images?: Record<string, unknown>;
  legalities?: Record<string, unknown>;
  printedTotal?: number;
  total?: number;
  releaseDate?: string;
  series?: string;
};

export interface SyncResult {
  setsUpserted: number;
  cardsUpserted: number;
}

const API_BASE = "https://api.pokemontcg.io/v2";

// Utility to ensure a value conforms to our Json type or undefined
function ensureJson(value: unknown): Database["public"]["Tables"]["cards"]["Row"]["raw"] | undefined {
  if (value === null || value === undefined) return undefined;
  // Allow primitives, arrays, and plain objects only
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value as never;
  }
  if (Array.isArray(value)) {
    return value as never;
  }
  if (typeof value === "object") {
    return value as never;
  }
  return undefined;
}

function getApiHeaders(): HeadersInit {
  const key = process.env.REACT_APP_POKEMON_TCG_API_KEY as string | undefined;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (key && key.length > 0) headers["X-Api-Key"] = key;
  return headers;
}

async function fetchAllSets(): Promise<SetApi[]> {
  const res = await fetch(`${API_BASE}/sets?pageSize=250`, { headers: getApiHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch sets: ${res.status}`);
  const body = (await res.json()) as { data: SetApi[] };
  return body.data ?? [];
}

async function fetchCardsByPage(page: number, pageSize: number): Promise<{ data: CardApi[]; page: number; pageSize: number; count?: number; totalCount?: number }>{
  const res = await fetch(`${API_BASE}/cards?page=${page}&pageSize=${pageSize}`, { headers: getApiHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch cards page ${page}: ${res.status}`);
  const body = (await res.json()) as { data: CardApi[]; page?: number; pageSize?: number; count?: number; totalCount?: number };
  return {
    data: body.data ?? [],
    page: body.page ?? page,
    pageSize: body.pageSize ?? pageSize,
    count: body.count,
    totalCount: body.totalCount,
  };
}

function mapSetToInsert(row: SetApi): TablesInsert<"sets"> {
  return {
    id: row.id,
    name: row.name,
    images: ensureJson(row.images) ?? null,
    legalities: ensureJson(row.legalities) ?? null,
    printed_total: typeof row.printedTotal === "number" ? row.printedTotal : null,
    total: typeof row.total === "number" ? row.total : null,
    release_date: row.releaseDate ?? null,
    series: row.series ?? null,
    raw: ensureJson(row) ?? null,
    synced_at: new Date().toISOString(),
  };
}

// Note: number_int is a generated column in DB, so we don't compute or send it

function mapCardToInsert(row: CardApi): TablesInsert<"cards"> {
  const setId = row.set?.id ?? "";
  return {
    id: row.id,
    name: row.name,
    number: row.number ?? null,
    images: ensureJson(row.images) ?? null,
    legalities: ensureJson(row.legalities) ?? null,
    rarity: row.rarity ?? null,
    raw: ensureJson(row) ?? null,
    set_id: setId,
    subtypes: row.subtypes ?? null,
    supertype: row.supertype ?? null,
    synced_at: new Date().toISOString(),
    tcgplayer_ref: ensureJson(row.tcgplayer) ?? null,
    cardmarket_ref: ensureJson(row.cardmarket) ?? null,
    types: row.types ?? null,
  };
}

async function logSyncRun(startedAt: string, ok: boolean, notes: unknown): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("sync_runs").insert({
    job: "pokemon_tcg_sync",
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    ok,
    notes: notes as Database["public"]["Tables"]["sync_runs"]["Row"]["notes"],
  });
}

export async function syncPokemonTcg(): Promise<SyncResult> {
  const supabase = getSupabaseClient();
  const started = new Date().toISOString();
  try {
    // 1) Sync sets first
    const sets = await fetchAllSets();
    const setInserts = sets.map(mapSetToInsert);
    if (setInserts.length > 0) {
      const { error } = await supabase
        .from("sets")
        .upsert(setInserts, { onConflict: "id", ignoreDuplicates: false });
      if (error) throw new Error(error.message);
    }

    // 2) Sync cards in pages: keep fetching until a page returns < pageSize
    let cardsUpserted = 0;
    const pageSize = 250;
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const chunk = await fetchCardsByPage(page, pageSize);
      const upserts = chunk.data.map(mapCardToInsert);
      if (upserts.length > 0) {
        const { error } = await supabase
          .from("cards")
          .upsert(upserts, { onConflict: "id", ignoreDuplicates: false });
        if (error) throw new Error(error.message);
        cardsUpserted += upserts.length;
      }
      if (chunk.data.length < pageSize) break;
      page += 1;
    }

    await logSyncRun(started, true, { sets: setInserts.length, cards: cardsUpserted });
    return { setsUpserted: setInserts.length, cardsUpserted };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await logSyncRun(started, false, { error: message });
    throw e;
  }
}


