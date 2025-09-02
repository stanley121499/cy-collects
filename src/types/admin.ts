/**
 * Type definitions for admin interface
 */

import { Database } from "../database.types";

// Database table types
export type Card = Database["public"]["Tables"]["cards"]["Row"];
export type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
export type Set = Database["public"]["Tables"]["sets"]["Row"];
export type PublicInventory = Database["public"]["Views"]["public_inventory"]["Row"];

// Admin navigation types
export interface AdminNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
}

// Card management types
export interface CardFilters {
  search?: string;
  set?: string;
  rarity?: string;
  type?: string;
  supertype?: string;
}

export interface InventoryFilters {
  search?: string;
  condition?: Database["public"]["Enums"]["card_condition"];
  language?: Database["public"]["Enums"]["card_language"];
  is_foil?: boolean;
  location?: string;
}

// Pricing types
export interface PriceData {
  card_id: string;
  current_price_cents?: number;
  suggested_price_cents?: number;
  last_updated?: string;
  market_trend?: "up" | "down" | "stable";
}

// Dashboard stats types
export interface DashboardStats {
  total_cards: number;
  total_inventory: number;
  total_value_cents: number;
  recent_additions: number;
  low_stock_alerts: number;
  sync_status: "idle" | "syncing" | "error";
  last_sync?: string;
}

// Form types
export interface InventoryFormData {
  card_id: string;
  quantity: number;
  condition: Database["public"]["Enums"]["card_condition"];
  language: Database["public"]["Enums"]["card_language"];
  is_foil: boolean;
  sale_price_cents?: number;
  location?: string;
  notes?: string;
  sku?: string;
}
