/**
 * DbContext
 * Centralized, typed CRUD access to Supabase tables and views.
 */
import React from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient, type TypedSupabaseClient } from "../lib/supabaseClient";
import type { Database, TablesInsert, TablesUpdate } from "../database.types";

// Narrowed row types for convenience
type CardRow = Database["public"]["Tables"]["cards"]["Row"];
type SetRow = Database["public"]["Tables"]["sets"]["Row"];
type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
type PublicInventoryRow = Database["public"]["Views"]["public_inventory"]["Row"];

export interface DbApi {
  client: TypedSupabaseClient;

  // Cards
  getCardById: (id: string) => Promise<CardRow | null>;
  upsertCards: (rows: ReadonlyArray<TablesInsert<"cards">>) => Promise<number>;

  // Sets
  upsertSets: (rows: ReadonlyArray<TablesInsert<"sets">>) => Promise<number>;
  getSetById: (id: string) => Promise<SetRow | null>;

  // Inventory
  listInventory: (filters?: Partial<InventoryRow>) => Promise<InventoryRow[]>;
  insertInventory: (row: TablesInsert<"inventory">) => Promise<InventoryRow | null>;
  updateInventory: (id: string, patch: TablesUpdate<"inventory">) => Promise<InventoryRow | null>;
  deleteInventory: (id: string) => Promise<boolean>;

  // Public view
  listPublicInventory: (params?: {
    search?: string;
    condition?: Database["public"]["Enums"]["card_condition"];
    language?: Database["public"]["Enums"]["card_language"];
  }) => Promise<PublicInventoryRow[]>;
}

const DbContext = React.createContext<DbApi | null>(null);

function mapPostgrestError(error: PostgrestError | null): string | null {
  if (!error) return null;
  return typeof error.message === "string" ? error.message : "Unknown database error";
}

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = React.useMemo(() => getSupabaseClient(), []);

  const api = React.useMemo<DbApi>(() => ({
    client,

    // Cards
    async getCardById(id) {
      const { data, error } = await client
        .from("cards")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return data ?? null;
    },
    async upsertCards(rows) {
      if (rows.length === 0) return 0;
      // Ensure a mutable array to satisfy the supabase typings (not readonly)
      const values: TablesInsert<"cards">[] = rows.map((r) => ({ ...r }));
      const { error, count } = await client
        .from("cards")
        .upsert(values, { onConflict: "id", ignoreDuplicates: false, count: "exact" });
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return typeof count === "number" ? count : values.length;
    },

    // Sets
    async upsertSets(rows) {
      if (rows.length === 0) return 0;
      // Ensure a mutable array to satisfy the supabase typings (not readonly)
      const values: TablesInsert<"sets">[] = rows.map((r) => ({ ...r }));
      const { error, count } = await client
        .from("sets")
        .upsert(values, { onConflict: "id", ignoreDuplicates: false, count: "exact" });
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return typeof count === "number" ? count : values.length;
    },
    async getSetById(id) {
      const { data, error } = await client
        .from("sets")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return data ?? null;
    },

    // Inventory
    async listInventory(filters) {
      let query = client.from("inventory").select("*");
      if (filters) {
        if (typeof filters.id === "string") query = query.eq("id", filters.id);
        if (typeof filters.card_id === "string") query = query.eq("card_id", filters.card_id);
        if (typeof filters.condition === "string") query = query.eq("condition", filters.condition);
        if (typeof filters.language === "string") query = query.eq("language", filters.language);
        if (typeof filters.location === "string") query = query.eq("location", filters.location);
        if (typeof filters.currency === "string") query = query.eq("currency", filters.currency);
        if (typeof filters.sku === "string") query = query.eq("sku", filters.sku);
        if (typeof filters.is_foil === "boolean") query = query.eq("is_foil", filters.is_foil);
        if (typeof filters.quantity === "number") query = query.eq("quantity", filters.quantity);
        if (typeof filters.sale_price_cents === "number") query = query.eq("sale_price_cents", filters.sale_price_cents);
      }
      const { data, error } = await query;
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return data ?? [];
    },
    async insertInventory(row) {
      const { data, error } = await client
        .from("inventory")
        .insert(row)
        .select("*")
        .maybeSingle();
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return data ?? null;
    },
    async updateInventory(id, patch) {
      const { data, error } = await client
        .from("inventory")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return data ?? null;
    },
    async deleteInventory(id) {
      const { error } = await client
        .from("inventory")
        .delete()
        .eq("id", id);
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return true;
    },

    // Public view
    async listPublicInventory(params) {
      let query = client.from("public_inventory").select("*");
      if (params?.search) {
        // Basic ILIKE match on card_name and set_name
        query = query.ilike("card_name", `%${params.search}%`);
      }
      if (params?.condition) {
        query = query.eq("condition", params.condition);
      }
      if (params?.language) {
        query = query.eq("language", params.language);
      }
      const { data, error } = await query;
      const errorMessage = mapPostgrestError(error);
      if (errorMessage) throw new Error(errorMessage);
      return data ?? [];
    },
  }), [client]);

  return <DbContext.Provider value={api}>{children}</DbContext.Provider>;
};

export const useDb = (): DbApi => {
  const ctx = React.useContext(DbContext);
  if (!ctx) {
    throw new Error("useDb must be used within a DbProvider");
  }
  return ctx;
};


