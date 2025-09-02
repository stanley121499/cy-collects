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
  // 1) upsert sets
  let res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ step: "sets" }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Sync failed with status ${res.status}`);
  }
  // 2) paginate cards, one page per request to avoid timeouts
  let page = 1;
  const pageSize = 250;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ step: "cards", page, pageSize }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Sync failed with status ${res.status}`);
    }
    const batch = (await res.json()) as { hasMore: boolean };
    if (!batch.hasMore) break;
    page += 1;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Sync failed with status ${res.status}`);
  }
  // The UI reads counts from the success to show a summary. Since the work is paginated on the server,
  // we return a simple acknowledgment. Detailed counts can be read from sync_runs if needed.
  return { setsUpserted: 0, cardsUpserted: 0 };
}


