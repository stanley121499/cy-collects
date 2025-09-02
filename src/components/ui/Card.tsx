/**
 * Reusable Card component for displaying content in containers
 */

import React from "react";
import { motion } from "framer-motion";

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg";
  shadow?: "sm" | "md" | "lg";
}

/**
 * Card component with modern styling and optional animations
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = "",
  hoverable = false,
  padding = "md",
  shadow = "md",
}) => {
  // Base styles
  const baseStyles = "bg-white rounded-lg border border-gray-200";
  
  // Padding styles
  const paddingStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  // Shadow styles
  const shadowStyles = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  // Hover styles
  const hoverStyles = hoverable ? "hover:shadow-lg transition-shadow duration-200 cursor-pointer" : "";

  const combinedClassName = [
    baseStyles,
    paddingStyles[padding],
    shadowStyles[shadow],
    hoverStyles,
    className,
  ].join(" ");

  const cardContent = (
    <div className={combinedClassName}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};
