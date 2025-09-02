/**
 * Admin sidebar navigation component
 */

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Archive,
  DollarSign,
  Settings,
  Users,
  RefreshCw,
} from "lucide-react";
import { AdminNavItem } from "../../types/admin";

export interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

/**
 * Admin sidebar with navigation menu
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed = false,
}) => {
  const location = useLocation();

  // Navigation items for admin panel
  const navItems: AdminNavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "LayoutDashboard",
      path: "/admin",
    },
    {
      id: "cards",
      label: "Card Management",
      icon: "Package",
      path: "/admin/cards",
    },
    {
      id: "inventory",
      label: "Card Showcase",
      icon: "Archive",
      path: "/admin/inventory",
      badge: "22", // Example badge for available cards
    },
    {
      id: "pricing",
      label: "Pricing",
      icon: "DollarSign",
      path: "/admin/pricing",
    },
    {
      id: "sync",
      label: "Data Sync",
      icon: "RefreshCw",
      path: "/admin/sync",
    },
    {
      id: "users",
      label: "Users",
      icon: "Users",
      path: "/admin/users",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "Settings",
      path: "/admin/settings",
    },
  ];

  // Icon mapping
  const iconMap = {
    LayoutDashboard,
    Package,
    Archive,
    DollarSign,
    Settings,
    Users,
    RefreshCw,
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  return (
    <motion.div
      className={`bg-gray-900 text-white h-full flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold">CY Collects</h2>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive: linkActive }) =>
                `group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  linkActive || isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="flex-shrink-0">
                  {getIcon(item.icon)}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* User info (placeholder) */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-300" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@cycollects.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
