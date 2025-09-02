/**
 * Card Binder component with page flipping functionality
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { PublicInventory } from "../../types/admin";

export interface CardBinderProps {
  cards: PublicInventory[];
  cardsPerPage?: number;
  onCardClick?: (card: PublicInventory) => void;
  onWhatsAppClick?: (card: PublicInventory) => void;
}

/**
 * Binder-style card display with page flipping
 */
export const CardBinder: React.FC<CardBinderProps> = ({
  cards,
  cardsPerPage = 9, // 3x3 grid per page
  onCardClick,
  onWhatsAppClick,
}) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [flipDirection, setFlipDirection] = React.useState<"left" | "right">("right");

  const totalPages = Math.ceil(cards.length / cardsPerPage);
  const currentCards = cards.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setFlipDirection("right");
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setFlipDirection("left");
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page !== currentPage) {
      setFlipDirection(page > currentPage ? "right" : "left");
      setCurrentPage(page);
    }
  };

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

  // Page flip animations
  const pageVariants = {
    enter: (direction: string) => ({
      rotateY: direction === "right" ? 180 : -180,
      opacity: 0,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      rotateY: direction === "right" ? -180 : 180,
      opacity: 0,
    }),
  };

  const pageTransition = {
    duration: 0.6,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  return (
    <div className="relative">
      {/* Binder Cover */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-8 rounded-xl shadow-2xl">
        {/* Binder Rings */}
        <div className="absolute left-4 top-8 bottom-8 w-6 flex flex-col justify-evenly">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gray-300 rounded-full border-2 border-gray-400 shadow-inner"
            />
          ))}
        </div>

        {/* Page Content */}
        <div className="ml-12 bg-white rounded-lg p-6 min-h-[600px] shadow-inner">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Pokemon Card Collection
              </h3>
              <p className="text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Card Grid with Page Flip Animation */}
          <div className="relative" style={{ perspective: "1000px" }}>
            <AnimatePresence mode="wait" custom={flipDirection}>
              <motion.div
                key={currentPage}
                custom={flipDirection}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
                className="grid grid-cols-3 gap-6"
              >
                {currentCards.map((card, index) => {
                  const imageUrl = card.images && typeof card.images === "object" && "small" in card.images 
                    ? (card.images as { small: string }).small 
                    : null;

                  return (
                    <motion.div
                      key={card.inventory_id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      {/* Card Slot */}
                      <div className="aspect-[2.5/3.5] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <motion.div
                            className="relative w-full h-full cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCardClick?.(card)}
                          >
                            <img
                              src={imageUrl}
                              alt={card.card_name || "Card"}
                              className="w-full h-full object-cover rounded-lg shadow-lg"
                            />
                            
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="mb-2"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>

                            {/* Foil indicator */}
                            {card.is_foil && (
                              <div className="absolute top-2 right-2">
                                <Badge variant="warning" size="sm">
                                  ✨ Foil
                                </Badge>
                              </div>
                            )}

                            {/* Quantity badge */}
                            <div className="absolute top-2 left-2">
                              <Badge 
                                variant={
                                  (card.quantity || 0) === 0 ? "danger" : 
                                  (card.quantity || 0) < 5 ? "warning" : "success"
                                }
                                size="sm"
                              >
                                {card.quantity || 0} in stock
                              </Badge>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-gray-400 text-center">
                            <div className="text-4xl mb-2">🎴</div>
                            <div className="text-sm">No Image</div>
                          </div>
                        )}
                      </div>

                      {/* Card Info */}
                      <div className="mt-3 text-center">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {card.card_name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {card.set_name} #{card.number}
                        </p>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <Badge variant={getConditionVariant(card.condition)} size="sm">
                            {card.condition}
                          </Badge>
                          <Badge variant="info" size="sm">
                            {card.language}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="font-semibold text-green-600 text-sm">
                            {formatCurrency(card.sale_price_cents)}
                          </p>
                        </div>
                        
                        {/* WhatsApp Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => onWhatsAppClick?.(card)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty slots */}
                {[...Array(cardsPerPage - currentCards.length)].map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="aspect-[2.5/3.5] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
                  >
                    <div className="text-gray-300 text-center">
                      <div className="text-2xl mb-1">📄</div>
                      <div className="text-xs">Empty Slot</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page Navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  currentPage === index
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
