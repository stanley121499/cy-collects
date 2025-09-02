export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cards: {
        Row: {
          cardmarket_ref: Json | null
          id: string
          images: Json | null
          legalities: Json | null
          name: string
          number: string | null
          number_int: number | null
          rarity: string | null
          raw: Json | null
          set_id: string
          subtypes: string[] | null
          supertype: string | null
          synced_at: string
          tcgplayer_ref: Json | null
          types: string[] | null
        }
        Insert: {
          cardmarket_ref?: Json | null
          id: string
          images?: Json | null
          legalities?: Json | null
          name: string
          number?: string | null
          number_int?: number | null
          rarity?: string | null
          raw?: Json | null
          set_id: string
          subtypes?: string[] | null
          supertype?: string | null
          synced_at?: string
          tcgplayer_ref?: Json | null
          types?: string[] | null
        }
        Update: {
          cardmarket_ref?: Json | null
          id?: string
          images?: Json | null
          legalities?: Json | null
          name?: string
          number?: string | null
          number_int?: number | null
          rarity?: string | null
          raw?: Json | null
          set_id?: string
          subtypes?: string[] | null
          supertype?: string | null
          synced_at?: string
          tcgplayer_ref?: Json | null
          types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          card_id: string
          condition: Database["public"]["Enums"]["card_condition"]
          created_at: string
          currency: string | null
          id: string
          is_foil: boolean
          language: Database["public"]["Enums"]["card_language"]
          location: string | null
          notes: string | null
          quantity: number
          sale_price_cents: number | null
          sku: string | null
          updated_at: string
        }
        Insert: {
          card_id: string
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          currency?: string | null
          id?: string
          is_foil?: boolean
          language?: Database["public"]["Enums"]["card_language"]
          location?: string | null
          notes?: string | null
          quantity: number
          sale_price_cents?: number | null
          sku?: string | null
          updated_at?: string
        }
        Update: {
          card_id?: string
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          currency?: string | null
          id?: string
          is_foil?: boolean
          language?: Database["public"]["Enums"]["card_language"]
          location?: string | null
          notes?: string | null
          quantity?: number
          sale_price_cents?: number | null
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          id: string
          images: Json | null
          legalities: Json | null
          name: string
          printed_total: number | null
          raw: Json | null
          release_date: string | null
          series: string | null
          synced_at: string
          total: number | null
        }
        Insert: {
          id: string
          images?: Json | null
          legalities?: Json | null
          name: string
          printed_total?: number | null
          raw?: Json | null
          release_date?: string | null
          series?: string | null
          synced_at?: string
          total?: number | null
        }
        Update: {
          id?: string
          images?: Json | null
          legalities?: Json | null
          name?: string
          printed_total?: number | null
          raw?: Json | null
          release_date?: string | null
          series?: string | null
          synced_at?: string
          total?: number | null
        }
        Relationships: []
      }
      sync_runs: {
        Row: {
          finished_at: string | null
          id: number
          job: string
          notes: Json | null
          ok: boolean | null
          started_at: string
        }
        Insert: {
          finished_at?: string | null
          id?: number
          job: string
          notes?: Json | null
          ok?: boolean | null
          started_at?: string
        }
        Update: {
          finished_at?: string | null
          id?: number
          job?: string
          notes?: Json | null
          ok?: boolean | null
          started_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_inventory: {
        Row: {
          card_id: string | null
          card_name: string | null
          condition: Database["public"]["Enums"]["card_condition"] | null
          created_at: string | null
          currency: string | null
          images: Json | null
          inventory_id: string | null
          is_foil: boolean | null
          language: Database["public"]["Enums"]["card_language"] | null
          location: string | null
          notes: string | null
          number: string | null
          number_int: number | null
          quantity: number | null
          rarity: string | null
          release_date: string | null
          sale_price_cents: number | null
          series: string | null
          set_id: string | null
          set_name: string | null
          sku: string | null
          subtypes: string[] | null
          supertype: string | null
          types: string[] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      card_condition: "NM" | "LP" | "MP" | "HP" | "DMG"
      card_language:
        | "EN"
        | "JA"
        | "ZH"
        | "FR"
        | "DE"
        | "ES"
        | "IT"
        | "PT"
        | "KO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      card_condition: ["NM", "LP", "MP", "HP", "DMG"],
      card_language: ["EN", "JA", "ZH", "FR", "DE", "ES", "IT", "PT", "KO"],
    },
  },
} as const
