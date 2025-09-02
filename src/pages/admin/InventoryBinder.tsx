/**
 * Binder-style Inventory page with card showcase and WhatsApp integration
 */

import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, MessageCircle, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { CardBinder } from "../../components/ui/CardBinder";
import { CardPopup } from "../../components/ui/CardPopup";
import { StockEditor } from "../../components/ui/StockEditor";
import { PublicInventory, InventoryFilters, InventoryFormData } from "../../types/admin";
import { Constants } from "../../database.types";

// Mock inventory data - replace with real API calls later
const mockInventory: PublicInventory[] = [
  {
    inventory_id: "inv-1",
    card_id: "xy1-1",
    card_name: "Venusaur EX",
    set_name: "XY Base Set",
    set_id: "xy1",
    number: "1",
    number_int: 1,
    rarity: "Rare Holo EX",
    condition: "NM",
    language: "EN",
    is_foil: false,
    quantity: 5,
    sale_price_cents: 2500, // $25.00
    location: "Box A1",
    sku: "VEN-EX-001",
    notes: "Mint condition, perfect for collectors",
    currency: "USD",
    created_at: "2025-01-09T10:00:00Z",
    updated_at: "2025-01-09T10:00:00Z",
    images: {
      small: "https://images.pokemontcg.io/xy1/1.png",
      large: "https://images.pokemontcg.io/xy1/1_hires.png",
    },
    supertype: "Pokémon",
    subtypes: ["Basic", "EX"],
    types: ["Grass"],
    series: "XY",
    release_date: "2014-02-05",
  },
  {
    inventory_id: "inv-2",
    card_id: "xy1-2",
    card_name: "M Venusaur EX",
    set_name: "XY Base Set",
    set_id: "xy1",
    number: "2",
    number_int: 2,
    rarity: "Rare Holo EX",
    condition: "LP",
    language: "EN",
    is_foil: true,
    quantity: 2,
    sale_price_cents: 4500, // $45.00
    location: "Box A1",
    sku: "M-VEN-EX-002",
    notes: "Slightly played but still great",
    currency: "USD",
    created_at: "2025-01-09T09:30:00Z",
    updated_at: "2025-01-09T09:30:00Z",
    images: {
      small: "https://images.pokemontcg.io/xy1/2.png",
      large: "https://images.pokemontcg.io/xy1/2_hires.png",
    },
    supertype: "Pokémon",
    subtypes: ["Mega", "EX"],
    types: ["Grass"],
    series: "XY",
    release_date: "2014-02-05",
  },
  // Add more mock cards to demonstrate pagination
  ...Array.from({ length: 20 }, (_, i) => ({
    inventory_id: `inv-${i + 3}`,
    card_id: `mock-${i + 3}`,
    card_name: `Mock Card ${i + 3}`,
    set_name: "Mock Set",
    set_id: "mock1",
    number: `${i + 3}`,
    number_int: i + 3,
    rarity: ["Common", "Uncommon", "Rare", "Rare Holo"][i % 4],
    condition: ["NM", "LP", "MP"][i % 3] as "NM" | "LP" | "MP",
    language: "EN" as const,
    is_foil: i % 5 === 0,
    quantity: Math.floor(Math.random() * 10) + 1,
    sale_price_cents: Math.floor(Math.random() * 5000) + 500,
    location: `Box ${String.fromCharCode(65 + (i % 3))}${Math.floor(i / 3) + 1}`,
    sku: `MOCK-${i + 3}`,
    notes: i % 3 === 0 ? "Great condition card" : null,
    currency: "USD",
    created_at: "2025-01-09T10:00:00Z",
    updated_at: "2025-01-09T10:00:00Z",
    images: null,
    supertype: "Pokémon",
    subtypes: ["Basic"],
    types: ["Fire", "Water", "Grass", "Electric"][i % 4] ? [["Fire", "Water", "Grass", "Electric"][i % 4]] : null,
    series: "Mock",
    release_date: "2024-01-01",
  })),
];

/**
 * Binder-style inventory page with showcase functionality
 */
export const InventoryBinder: React.FC = () => {
  const [filters, setFilters] = React.useState<InventoryFilters>({});
  const [filteredCards, setFilteredCards] = React.useState<PublicInventory[]>(mockInventory);
  const [selectedCard, setSelectedCard] = React.useState<PublicInventory | null>(null);
  const [showCardPopup, setShowCardPopup] = React.useState(false);
  const [showStockEditor, setShowStockEditor] = React.useState(false);

  // Filter cards based on current filters
  React.useEffect(() => {
    let filtered = mockInventory;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        card =>
          card.card_name?.toLowerCase().includes(searchLower) ||
          card.set_name?.toLowerCase().includes(searchLower) ||
          card.number?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.condition) {
      filtered = filtered.filter(card => card.condition === filters.condition);
    }

    if (filters.language) {
      filtered = filtered.filter(card => card.language === filters.language);
    }

    if (filters.is_foil !== undefined) {
      filtered = filtered.filter(card => card.is_foil === filters.is_foil);
    }

    if (filters.location) {
      filtered = filtered.filter(card => 
        card.location?.toLowerCase().includes(filters.location?.toLowerCase() || "")
      );
    }

    setFilteredCards(filtered);
  }, [filters]);

  // Filter change handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value });
  };

  const handleConditionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ 
      ...filters, 
      condition: event.target.value as typeof filters.condition || undefined 
    });
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ 
      ...filters, 
      language: event.target.value as typeof filters.language || undefined 
    });
  };

  const handleFoilChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilters({ 
      ...filters, 
      is_foil: value === "" ? undefined : value === "true"
    });
  };

  // Card interaction handlers
  const handleCardClick = (card: PublicInventory) => {
    setSelectedCard(card);
    setShowCardPopup(true);
  };

  const handleWhatsAppClick = (card: PublicInventory) => {
    const message = encodeURIComponent(
      `Hi! I'm interested in the ${card.card_name} from ${card.set_name} (#${card.number}). ` +
      `Condition: ${card.condition}, Language: ${card.language}${card.is_foil ? ", Foil" : ""}. ` +
      `Is it still available?`
    );
    const whatsappUrl = `https://wa.me/1234567890?text=${message}`; // Replace with actual WhatsApp number
    window.open(whatsappUrl, "_blank");
  };

  const handleEditStock = (card: PublicInventory) => {
    setSelectedCard(card);
    setShowStockEditor(true);
  };

  const handleSaveStock = (formData: InventoryFormData) => {
    // TODO: Implement API call to save stock data
    console.log("Saving stock data:", formData);
    // For now, just close the editor
    setShowStockEditor(false);
  };

  // Format currency
  const formatCurrency = (cents: number | null) => {
    if (!cents) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Calculate stats
  const totalItems = filteredCards.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = filteredCards.reduce((sum, item) => 
    sum + ((item.sale_price_cents || 0) * (item.quantity || 0)), 0
  );
  const lowStockItems = filteredCards.filter(item => (item.quantity || 0) < 5).length;

  // Filter options
  const conditionOptions = [
    { value: "", label: "All Conditions" },
    ...Constants.public.Enums.card_condition.map(condition => ({
      value: condition,
      label: condition,
    })),
  ];

  const languageOptions = [
    { value: "", label: "All Languages" },
    ...Constants.public.Enums.card_language.map(language => ({
      value: language,
      label: language,
    })),
  ];

  const foilOptions = [
    { value: "", label: "All Cards" },
    { value: "true", label: "Foil Only" },
    { value: "false", label: "Non-Foil Only" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Card Collection Showcase</h2>
        <p className="text-gray-600 mt-1">
          Browse our Pokemon card collection. Click on any card to view details or contact us via WhatsApp.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card hoverable>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hoverable>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collection Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hoverable>
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Sets</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(filteredCards.map(card => card.set_name)).size}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search cards by name, set, or number..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              fullWidth
            />
          </div>
          <Select
            placeholder="Filter by condition"
            options={conditionOptions}
            value={filters.condition || ""}
            onChange={handleConditionChange}
            fullWidth
          />
          <Select
            placeholder="Filter by language"
            options={languageOptions}
            value={filters.language || ""}
            onChange={handleLanguageChange}
            fullWidth
          />
          <Select
            placeholder="Filter by foil"
            options={foilOptions}
            value={filters.is_foil === undefined ? "" : filters.is_foil.toString()}
            onChange={handleFoilChange}
            fullWidth
          />
        </div>
      </Card>

      {/* Card Binder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <CardBinder
          cards={filteredCards}
          cardsPerPage={9}
          onCardClick={handleCardClick}
          onWhatsAppClick={handleWhatsAppClick}
        />
      </motion.div>

      {/* Card Popup */}
      <CardPopup
        card={selectedCard}
        isOpen={showCardPopup}
        onClose={() => setShowCardPopup(false)}
        onWhatsAppClick={handleWhatsAppClick}
        onEditClick={handleEditStock}
      />

      {/* Stock Editor */}
      <StockEditor
        card={selectedCard}
        isOpen={showStockEditor}
        onClose={() => setShowStockEditor(false)}
        onSave={handleSaveStock}
      />
    </div>
  );
};
