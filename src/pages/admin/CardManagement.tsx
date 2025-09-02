/**
 * Card Management page for viewing and managing Pokemon cards
 */

import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Table, TableColumn } from "../../components/ui/Table";
import { Card as CardType, CardFilters } from "../../types/admin";

// Mock card data - replace with real API calls later
const mockCards: CardType[] = [
  {
    id: "xy1-1",
    name: "Venusaur EX",
    set_id: "xy1",
    number: "1",
    number_int: 1,
    rarity: "Rare Holo EX",
    supertype: "Pokémon",
    subtypes: ["Basic", "EX"],
    types: ["Grass"],
    images: {
      small: "https://images.pokemontcg.io/xy1/1.png",
      large: "https://images.pokemontcg.io/xy1/1_hires.png",
    },
    legalities: { standard: "Legal", expanded: "Legal" },
    tcgplayer_ref: null,
    cardmarket_ref: null,
    raw: null,
    synced_at: "2025-01-09T10:00:00Z",
  },
  {
    id: "xy1-2",
    name: "M Venusaur EX",
    set_id: "xy1",
    number: "2",
    number_int: 2,
    rarity: "Rare Holo EX",
    supertype: "Pokémon",
    subtypes: ["Mega", "EX"],
    types: ["Grass"],
    images: {
      small: "https://images.pokemontcg.io/xy1/2.png",
      large: "https://images.pokemontcg.io/xy1/2_hires.png",
    },
    legalities: { standard: "Legal", expanded: "Legal" },
    tcgplayer_ref: null,
    cardmarket_ref: null,
    raw: null,
    synced_at: "2025-01-09T10:00:00Z",
  },
];

/**
 * Card Management page for browsing and managing Pokemon cards
 */
export const CardManagement: React.FC = () => {
  const [filters, setFilters] = React.useState<CardFilters>({});
  const [sortColumn, setSortColumn] = React.useState<keyof CardType>("name");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  // Filter change handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value });
  };

  const handleRarityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, rarity: event.target.value || undefined });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, type: event.target.value || undefined });
  };

  // Sort handler
  const handleSort = (column: keyof CardType) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Rarity options
  const rarityOptions = [
    { value: "", label: "All Rarities" },
    { value: "Common", label: "Common" },
    { value: "Uncommon", label: "Uncommon" },
    { value: "Rare", label: "Rare" },
    { value: "Rare Holo", label: "Rare Holo" },
    { value: "Rare Holo EX", label: "Rare Holo EX" },
    { value: "Rare Holo GX", label: "Rare Holo GX" },
    { value: "Rare Holo V", label: "Rare Holo V" },
    { value: "Rare Holo VMAX", label: "Rare Holo VMAX" },
  ];

  // Type options
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "Colorless", label: "Colorless" },
    { value: "Darkness", label: "Darkness" },
    { value: "Dragon", label: "Dragon" },
    { value: "Fairy", label: "Fairy" },
    { value: "Fighting", label: "Fighting" },
    { value: "Fire", label: "Fire" },
    { value: "Grass", label: "Grass" },
    { value: "Lightning", label: "Lightning" },
    { value: "Metal", label: "Metal" },
    { value: "Psychic", label: "Psychic" },
    { value: "Water", label: "Water" },
  ];

  // Table columns
  const columns: TableColumn<CardType>[] = [
    {
      key: "images",
      title: "Image",
      width: "80px",
      render: (value) => {
        const images = value as CardType["images"];
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
      key: "name",
      title: "Name",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-gray-500">#{row.number}</div>
        </div>
      ),
    },
    {
      key: "rarity",
      title: "Rarity",
      sortable: true,
      render: (value) => {
        const rarity = value as string;
        const variant = rarity?.includes("EX") || rarity?.includes("GX") || rarity?.includes("V")
          ? "danger"
          : rarity?.includes("Rare")
          ? "warning"
          : "default";
        
        return <Badge variant={variant}>{rarity || "Unknown"}</Badge>;
      },
    },
    {
      key: "types",
      title: "Type",
      render: (value) => {
        const types = value as string[];
        return types?.length > 0 ? (
          <div className="flex space-x-1">
            {types.slice(0, 2).map((type, index) => (
              <Badge key={index} variant="info" size="sm">
                {type}
              </Badge>
            ))}
            {types.length > 2 && (
              <Badge variant="default" size="sm">
                +{types.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: "supertype",
      title: "Supertype",
      sortable: true,
    },
    {
      key: "id",
      title: "Actions",
      width: "120px",
      render: (value) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className="p-1">
            <Eye className="h-4 w-4" />
          </Button>
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Card Management</h2>
          <p className="text-gray-600 mt-1">
            Browse and manage your Pokemon card database.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search cards by name..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              fullWidth
            />
          </div>
          <Select
            placeholder="Filter by rarity"
            options={rarityOptions}
            value={filters.rarity || ""}
            onChange={handleRarityChange}
            fullWidth
          />
          <Select
            placeholder="Filter by type"
            options={typeOptions}
            value={filters.type || ""}
            onChange={handleTypeChange}
            fullWidth
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cards</p>
              <p className="text-2xl font-semibold">{mockCards.length.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Sets</p>
              <p className="text-2xl font-semibold">1</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Filter className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-2xl font-semibold">2h ago</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cards table */}
      <Card>
        <Table
          columns={columns}
          data={mockCards}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No cards found matching your filters."
        />
      </Card>
    </div>
  );
};
