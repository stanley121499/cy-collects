export interface SyncResult {
  setsUpserted: number;
  cardsUpserted: number;
}

export async function syncPokemonTcg(): Promise<SyncResult> {
  // Prefer calling the serverless function to avoid CORS and write limits
  const endpoint = "/api/sync";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const syncToken = process.env.REACT_APP_SYNC_TOKEN as string | undefined;
  if (typeof syncToken === "string" && syncToken.length > 0) {
    headers["x-sync-token"] = syncToken;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Sync failed with status ${res.status}`);
  }
  const body = (await res.json()) as SyncResult;
  return body;
}


