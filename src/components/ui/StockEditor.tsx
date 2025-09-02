/**
 * Stock Editor side panel for managing card inventory
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Package, DollarSign, MapPin, FileText } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { PublicInventory, InventoryFormData } from "../../types/admin";
import { Constants } from "../../database.types";

export interface StockEditorProps {
  card: PublicInventory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (formData: InventoryFormData) => void;
}

/**
 * Side panel for editing card stock and inventory details
 */
export const StockEditor: React.FC<StockEditorProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<InventoryFormData>({
    card_id: "",
    quantity: 0,
    condition: "NM",
    language: "EN",
    is_foil: false,
    sale_price_cents: undefined,
    location: "",
    notes: "",
    sku: "",
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof InventoryFormData, string>>>({});

  // Update form data when card changes
  React.useEffect(() => {
    if (card) {
      setFormData({
        card_id: card.card_id || "",
        quantity: card.quantity || 0,
        condition: card.condition || "NM",
        language: card.language || "EN",
        is_foil: card.is_foil || false,
        sale_price_cents: card.sale_price_cents || undefined,
        location: card.location || "",
        notes: card.notes || "",
        sku: card.sku || "",
      });
    }
  }, [card]);

  const handleInputChange = (field: keyof InventoryFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InventoryFormData, string>> = {};

    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    if (formData.sale_price_cents !== undefined && formData.sale_price_cents < 0) {
      newErrors.sale_price_cents = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(formData);
      onClose();
    }
  };

  // Format price for display
  const formatPrice = (cents: number | undefined) => {
    if (!cents) return "";
    return (cents / 100).toFixed(2);
  };

  // Parse price from input
  const parsePrice = (value: string): number | undefined => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : Math.round(parsed * 100);
  };

  // Condition options
  const conditionOptions = Constants.public.Enums.card_condition.map(condition => ({
    value: condition,
    label: condition,
  }));

  // Language options
  const languageOptions = Constants.public.Enums.card_language.map(language => ({
    value: language,
    label: language,
  }));

  if (!card) return null;

  const imageUrl = card.images && typeof card.images === "object" && "small" in card.images 
    ? (card.images as { small: string }).small 
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Edit Stock
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Card Preview */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center space-x-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={card.card_name || "Card"}
                      className="w-16 h-20 object-cover rounded border shadow"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-gray-200 rounded border flex items-center justify-center">
                      <span className="text-2xl">🎴</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {card.card_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {card.set_name} #{card.number}
                    </p>
                    <div className="flex space-x-1 mt-1">
                      <Badge variant="info" size="sm">{card.rarity}</Badge>
                      {card.is_foil && (
                        <Badge variant="warning" size="sm">✨</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stock Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Stock Information
                </h3>

                <Input
                  label="Quantity"
                  type="number"
                  value={formData.quantity.toString()}
                  onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)}
                  error={errors.quantity}
                  min="0"
                  fullWidth
                />

                <Select
                  label="Condition"
                  options={conditionOptions}
                  value={formData.condition}
                  onChange={(e) => handleInputChange("condition", e.target.value as any)}
                  fullWidth
                />

                <Select
                  label="Language"
                  options={languageOptions}
                  value={formData.language}
                  onChange={(e) => handleInputChange("language", e.target.value as any)}
                  fullWidth
                />

                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Foil:</span>
                  <Button
                    variant={formData.is_foil ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange("is_foil", !formData.is_foil)}
                  >
                    {formData.is_foil ? "✨ Yes" : "No"}
                  </Button>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing
                </h3>

                <Input
                  label="Sale Price (USD)"
                  type="number"
                  step="0.01"
                  value={formatPrice(formData.sale_price_cents)}
                  onChange={(e) => {
                    const parsedPrice = parsePrice(e.target.value);
                    handleInputChange("sale_price_cents", parsedPrice ?? 0);
                  }}
                  error={errors.sale_price_cents}
                  placeholder="0.00"
                  helperText="Leave empty for 'Ask for price'"
                  fullWidth
                />
              </div>

              {/* Location & Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location & Details
                </h3>

                <Input
                  label="Location"
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., Box A1, Shelf 2"
                  fullWidth
                />

                <Input
                  label="SKU"
                  value={formData.sku || ""}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Optional SKU code"
                  fullWidth
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes about this card..."
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50">
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
