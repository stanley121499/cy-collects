/**
 * Inventory Management page for managing card inventory
 */

import React from "react";
import { motion } from "framer-motion";
import { Plus, Package, AlertTriangle, TrendingUp, Edit, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Table, TableColumn } from "../../components/ui/Table";
import { PublicInventory, InventoryFilters } from "../../types/admin";
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
];

/**
 * Inventory page for managing card stock and pricing
 */
export const Inventory: React.FC = () => {
  const [filters, setFilters] = React.useState<InventoryFilters>({});
  const [sortColumn, setSortColumn] = React.useState<keyof PublicInventory>("card_name");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

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

  // Sort handler
  const handleSort = (column: keyof PublicInventory) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Format currency
  const formatCurrency = (cents: number | null) => {
    if (!cents) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Get condition badge variant
  const getConditionVariant = (condition: string | null) => {
    switch (condition) {
      case "NM": return "success";
      case "LP": return "info";
      case "MP": return "warning";
      case "HP": return "danger";
      case "DMG": return "danger";
      default: return "default";
    }
  };

  // Condition options
  const conditionOptions = [
    { value: "", label: "All Conditions" },
    ...Constants.public.Enums.card_condition.map(condition => ({
      value: condition,
      label: condition,
    })),
  ];

  // Language options
  const languageOptions = [
    { value: "", label: "All Languages" },
    ...Constants.public.Enums.card_language.map(language => ({
      value: language,
      label: language,
    })),
  ];

  // Table columns
  const columns: TableColumn<PublicInventory>[] = [
    {
      key: "images",
      title: "Image",
      width: "80px",
      render: (value) => {
        const images = value as PublicInventory["images"];
        const imageUrl = images && typeof images === "object" && "small" in images 
          ? (images as { small: string }).small 
          : null;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Card"
            className="w-12 h-16 object-cover rounded border"
          />
        ) : (
          <div className="w-12 h-16 bg-gray-200 rounded border flex items-center justify-center">
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        );
      },
    },
    {
      key: "card_name",
      title: "Card",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-gray-500">
            {row.set_name} #{row.number}
          </div>
          {row.is_foil && (
            <Badge variant="warning" size="sm" className="mt-1">
              Foil
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "condition",
      title: "Condition",
      sortable: true,
      render: (value) => (
        <Badge variant={getConditionVariant(value as string)}>
          {value as string}
        </Badge>
      ),
    },
    {
      key: "language",
      title: "Language",
      sortable: true,
      render: (value) => (
        <Badge variant="info" size="sm">
          {value as string}
        </Badge>
      ),
    },
    {
      key: "quantity",
      title: "Quantity",
      sortable: true,
      render: (value) => {
        const qty = value as number;
        const variant = qty === 0 ? "danger" : qty < 5 ? "warning" : "success";
        return <Badge variant={variant}>{qty}</Badge>;
      },
    },
    {
      key: "sale_price_cents",
      title: "Price",
      sortable: true,
      render: (value) => (
        <span className="font-medium">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: "location",
      title: "Location",
      render: (value) => value as string || "-",
    },
    {
      key: "inventory_id",
      title: "Actions",
      width: "100px",
      render: () => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className="p-1">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate stats
  const totalItems = mockInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = mockInventory.reduce((sum, item) => 
    sum + ((item.sale_price_cents || 0) * (item.quantity || 0)), 0
  );
  const lowStockItems = mockInventory.filter(item => (item.quantity || 0) < 5).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your card inventory, quantities, and pricing.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory
        </Button>
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
                <p className="text-sm font-medium text-gray-600">Total Items</p>
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
                <p className="text-sm font-medium text-gray-600">Total Value</p>
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
              <div className="p-3 rounded-lg bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search inventory by card name..."
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
        </div>
      </Card>

      {/* Inventory table */}
      <Card>
        <Table
          columns={columns}
          data={mockInventory}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No inventory items found matching your filters."
        />
      </Card>
    </div>
  );
};
