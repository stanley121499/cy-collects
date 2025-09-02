/**
 * Vercel Serverless Function: /api/sync
 * Performs the Pokémon data sync server-side to avoid CORS and client write restrictions.
 * - Uses Supabase service role to upsert into `sets` and `cards`
 * - Paginates the Pokémon cards API until all pages are processed
 * - Returns counts of processed rows
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "../src/database.types";

type CardApi = {
  id: string;
  name: string;
  number?: string;
  images?: { small?: string; large?: string };
  legalities?: Record<string, unknown>;
  rarity?: string;
  set?: { id: string };
  subtypes?: string[];
  supertype?: string;
  tcgplayer?: Record<string, unknown>;
  cardmarket?: Record<string, unknown>;
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

const API_BASE = "https://api.pokemontcg.io/v2";

function getApiHeaders(): HeadersInit {
  const key = process.env.POKEMON_TCG_API_KEY as string | undefined;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (key && key.length > 0) headers["X-Api-Key"] = key;
  return headers;
}

interface VercelRequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponseLike {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
  end: () => void;
}

function allowCors(res: VercelResponseLike): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-sync-token");
}

function getSupabaseAdmin(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL as string | undefined;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false } });
}

function ensureJson(value: unknown): Database["public"]["Tables"]["cards"]["Row"]["raw"] | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value as never;
  if (Array.isArray(value)) return value as never;
  if (typeof value === "object") return value as never;
  return undefined;
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

async function fetchAllSets(): Promise<SetApi[]> {
  const res = await fetch(`${API_BASE}/sets?pageSize=250`, { headers: getApiHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch sets: ${res.status}`);
  const body = (await res.json()) as { data: SetApi[] };
  return body.data ?? [];
}

async function fetchCardsByPage(page: number, pageSize: number): Promise<CardApi[]> {
  const res = await fetch(`${API_BASE}/cards?page=${page}&pageSize=${pageSize}`, { headers: getApiHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch cards page ${page}: ${res.status}`);
  const body = (await res.json()) as { data: CardApi[] };
  return body.data ?? [];
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  allowCors(res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Optional shared secret header to prevent public abuse
  const expectedToken = process.env.SYNC_TOKEN as string | undefined;
  const providedToken = (req.headers["x-sync-token"] as string | undefined) ?? undefined;
  if (expectedToken && expectedToken.length > 0) {
    if (!providedToken || providedToken !== expectedToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const supabase = getSupabaseAdmin();

  try {
    // Sync sets
    const sets = await fetchAllSets();
    const setInserts = sets.map(mapSetToInsert);
    if (setInserts.length > 0) {
      const { error } = await supabase
        .from("sets")
        .upsert(setInserts, { onConflict: "id", ignoreDuplicates: false });
      if (error) throw new Error(error.message);
    }

    // Sync cards by pages
    let cardsUpserted = 0;
    const pageSize = 250;
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const data = await fetchCardsByPage(page, pageSize);
      if (data.length === 0) break;
      const upserts = data.map(mapCardToInsert);
      const { error } = await supabase
        .from("cards")
        .upsert(upserts, { onConflict: "id", ignoreDuplicates: false });
      if (error) throw new Error(error.message);
      cardsUpserted += upserts.length;
      if (data.length < pageSize) break;
      page += 1;
    }

    await supabase.from("sync_runs").insert({
      job: "seed_cards",
      ok: true,
      notes: { sets: setInserts.length, cards: cardsUpserted } as Database["public"]["Tables"]["sync_runs"]["Row"]["notes"],
      finished_at: new Date().toISOString(),
    });

    return res.status(200).json({ setsUpserted: setInserts.length, cardsUpserted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await supabase.from("sync_runs").insert({
      job: "seed_cards",
      ok: false,
      notes: { error: message } as Database["public"]["Tables"]["sync_runs"]["Row"]["notes"],
      finished_at: new Date().toISOString(),
    });
    return res.status(500).json({ error: message });
  }
}


