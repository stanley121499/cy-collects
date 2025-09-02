/**
 * Card popup with tilt effect and detailed view
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Star, Package, MapPin } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { PublicInventory } from "../../types/admin";

export interface CardPopupProps {
  card: PublicInventory | null;
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppClick?: (card: PublicInventory) => void;
  onEditClick?: (card: PublicInventory) => void;
}

/**
 * Popup modal for displaying card details with tilt animation
 */
export const CardPopup: React.FC<CardPopupProps> = ({
  card,
  isOpen,
  onClose,
  onWhatsAppClick,
  onEditClick,
}) => {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = (e.clientY - centerY) / 10;
    const rotateY = (e.clientX - centerX) / 10;
    
    setTilt({ x: -rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!card) return null;

  // Format currency
  const formatCurrency = (cents: number | null) => {
    if (!cents) return "Ask for price";
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

  const imageUrl = card.images && typeof card.images === "object" && "small" in card.images 
    ? (card.images as { large?: string, small: string }).large || (card.images as { small: string }).small
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {card.card_name}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Card Image with Tilt Effect */}
              <div className="lg:w-1/2 p-6 flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50">
                <motion.div
                  className="relative"
                  style={{ perspective: "1000px" }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <motion.div
                    animate={{
                      rotateX: tilt.x,
                      rotateY: tilt.y,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={card.card_name || "Card"}
                        className="max-w-full max-h-96 object-contain rounded-xl shadow-2xl"
                        style={{
                          filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.3))",
                        }}
                      />
                    ) : (
                      <div className="w-64 h-80 bg-gray-200 rounded-xl flex items-center justify-center shadow-2xl">
                        <div className="text-gray-400 text-center">
                          <div className="text-6xl mb-4">🎴</div>
                          <div className="text-lg">No Image Available</div>
                        </div>
                      </div>
                    )}

                    {/* Foil Shine Effect */}
                    {card.is_foil && (
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-30"
                        style={{
                          background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                          transform: `translateX(${tilt.y * 2}px) translateY(${tilt.x * 2}px)`,
                        }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Card Details */}
              <div className="lg:w-1/2 p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Card Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Set:</span>
                      <span className="font-medium">{card.set_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number:</span>
                      <span className="font-medium">#{card.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rarity:</span>
                      <Badge variant="warning">{card.rarity}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <div className="flex space-x-1">
                        {card.types?.map((type, index) => (
                          <Badge key={index} variant="info" size="sm">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Inventory Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <Badge variant={getConditionVariant(card.condition)}>
                        {card.condition}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <Badge variant="info">{card.language}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Foil:</span>
                      <Badge variant={card.is_foil ? "warning" : "default"}>
                        {card.is_foil ? "✨ Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <Badge 
                        variant={
                          (card.quantity || 0) === 0 ? "danger" : 
                          (card.quantity || 0) < 5 ? "warning" : "success"
                        }
                      >
                        {card.quantity || 0} in stock
                      </Badge>
                    </div>
                    {card.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Location:
                        </span>
                        <span className="font-medium">{card.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(card.sale_price_cents)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {card.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                      {card.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => onWhatsAppClick?.(card)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact on WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onEditClick?.(card)}
                  >
                    Edit Stock
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
