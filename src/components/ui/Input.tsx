/**
 * Reusable Input component with validation and styling
 */

import React from "react";

export interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  type?: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

/**
 * Input component with modern styling and validation support
 */
export const Input: React.FC<InputProps> = ({
  id,
  name,
  label,
  placeholder,
  value,
  type = "text",
  required = false,
  disabled = false,
  error,
  helperText,
  onChange,
  onBlur,
  onFocus,
  className = "",
  fullWidth = false,
  min,
  max,
  step,
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Base input styles
  const baseInputStyles = "block px-3 py-2 border rounded-lg text-sm placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  // State-based styles
  const stateStyles = error
    ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500";
  
  // Disabled styles
  const disabledStyles = disabled
    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
    : "bg-white hover:border-gray-400";
  
  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  const inputClassName = [
    baseInputStyles,
    stateStyles,
    disabledStyles,
    widthStyles,
    className,
  ].join(" ");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={inputClassName}
        min={min}
        max={max}
        step={step}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
