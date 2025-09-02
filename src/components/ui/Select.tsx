/**
 * Reusable Select component with modern styling
 */

import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Select component with modern styling and validation support
 */
export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  value,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  onChange,
  onBlur,
  className = "",
  fullWidth = false,
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  // Base select styles
  const baseSelectStyles = "block px-3 py-2 pr-10 border rounded-lg text-sm bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none";
  
  // State-based styles
  const stateStyles = error
    ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500";
  
  // Disabled styles
  const disabledStyles = disabled
    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
    : "hover:border-gray-400";
  
  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  const selectClassName = [
    baseSelectStyles,
    stateStyles,
    disabledStyles,
    widthStyles,
    className,
  ].join(" ");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          className={selectClassName}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
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
