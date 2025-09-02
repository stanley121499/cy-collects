export interface SyncResult {
  setsUpserted: number;
  cardsUpserted: number;
}

export async function syncPokemonTcg(): Promise<SyncResult> {
  // Prefer calling the serverless function to avoid CORS and write limits
  const endpoint = "/api/sync";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Sync failed with status ${res.status}`);
  }
  const body = (await res.json()) as SyncResult;
  return body;
}


