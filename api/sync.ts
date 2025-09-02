/**
 * Vercel Edge Function: /api/sync
 * - Edge runtime avoids CommonJS/ESM issues and runs close to users.
 * - Uses Supabase service role to upsert into `sets` and `cards`.
 * - Paginates Pokémon API and returns counts.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "../src/database.types";
export const config = { runtime: "edge" };

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-sync-token",
};

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Optional shared secret header to prevent abuse
  const expectedToken = process.env.SYNC_TOKEN as string | undefined;
  const providedToken = req.headers.get("x-sync-token") ?? undefined;
  if (expectedToken && expectedToken.length > 0) {
    if (!providedToken || providedToken !== expectedToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = getSupabaseAdmin();
  try {
    // Read body for step/pagination
    let body: { step?: string; page?: number; pageSize?: number } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch (_) {
      body = {};
    }

    const step = (body.step ?? "sets") as "sets" | "cards";
    const page = typeof body.page === "number" && body.page > 0 ? body.page : 1;
    const pageSize = typeof body.pageSize === "number" && body.pageSize > 0 ? body.pageSize : 250;

    if (step === "sets") {
      const sets = await fetchAllSets();
      const setInserts = sets.map(mapSetToInsert);
      if (setInserts.length > 0) {
        const { error } = await supabase
          .from("sets")
          .upsert(setInserts, { onConflict: "id", ignoreDuplicates: false });
        if (error) throw new Error(error.message);
      }
      await supabase.from("sync_runs").insert({
        job: "seed_cards",
        ok: true,
        notes: { sets: setInserts.length, step: "sets" } as Database["public"]["Tables"]["sync_runs"]["Row"]["notes"],
        finished_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ step: "sets", setsUpserted: setInserts.length, next: { step: "cards", page: 1, pageSize } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // step === 'cards' → process a single page per request
    const data = await fetchCardsByPage(page, pageSize);
    const upserts = data.map(mapCardToInsert);
    if (upserts.length > 0) {
      const { error } = await supabase
        .from("cards")
        .upsert(upserts, { onConflict: "id", ignoreDuplicates: false });
      if (error) throw new Error(error.message);
    }
    const hasMore = data.length === pageSize;
    return new Response(
      JSON.stringify({ step: "cards", processed: upserts.length, page, pageSize, hasMore, nextPage: hasMore ? page + 1 : null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await supabase.from("sync_runs").insert({
      job: "seed_cards",
      ok: false,
      notes: { error: message } as Database["public"]["Tables"]["sync_runs"]["Row"]["notes"],
      finished_at: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}


