/**
 * Admin Dashboard page with overview stats and recent activity
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  Archive,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Table, TableColumn } from "../../components/ui/Table";
import { DashboardStats } from "../../types/admin";

// Mock data - replace with real API calls later
const mockStats: DashboardStats = {
  total_cards: 15420,
  total_inventory: 8934,
  total_value_cents: 125000000, // $1,250,000
  recent_additions: 45,
  low_stock_alerts: 12,
  sync_status: "idle",
  last_sync: "2025-01-09T10:30:00Z",
};

const mockRecentActivity = [
  {
    id: "1",
    action: "Added inventory",
    card_name: "Charizard VMAX",
    set_name: "Champion's Path",
    quantity: 5,
    timestamp: "2025-01-09T09:15:00Z",
    user: "Admin",
  },
  {
    id: "2",
    action: "Price updated",
    card_name: "Pikachu VMAX",
    set_name: "Vivid Voltage",
    quantity: 0,
    timestamp: "2025-01-09T08:45:00Z",
    user: "Admin",
  },
  {
    id: "3",
    action: "Sold item",
    card_name: "Alakazam EX",
    set_name: "Fates Collide",
    quantity: -2,
    timestamp: "2025-01-09T07:30:00Z",
    user: "System",
  },
];

/**
 * Dashboard page with key metrics and recent activity
 */
export const Dashboard: React.FC = () => {
  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Total Cards",
      value: mockStats.total_cards.toLocaleString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Inventory Items",
      value: mockStats.total_inventory.toLocaleString(),
      icon: Archive,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Value",
      value: formatCurrency(mockStats.total_value_cents),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Recent Additions",
      value: mockStats.recent_additions.toString(),
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  // Table columns for recent activity
  const activityColumns: TableColumn<typeof mockRecentActivity[0]>[] = [
    {
      key: "action",
      title: "Action",
      render: (value) => <Badge variant="info">{value as string}</Badge>,
    },
    {
      key: "card_name",
      title: "Card",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-gray-500">{row.set_name}</div>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Quantity",
      render: (value) => {
        const qty = value as number;
        if (qty === 0) return "-";
        return (
          <span className={qty > 0 ? "text-green-600" : "text-red-600"}>
            {qty > 0 ? "+" : ""}{qty}
          </span>
        );
      },
    },
    {
      key: "timestamp",
      title: "Time",
      render: (value) => formatRelativeTime(value as string),
    },
    {
      key: "user",
      title: "User",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with your Pokemon card collection.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hoverable>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts and status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low stock alerts */}
        <Card title="Low Stock Alerts" className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-gray-600">Items below minimum stock</span>
            </div>
            <Badge variant="warning">{mockStats.low_stock_alerts}</Badge>
          </div>
        </Card>

        {/* Sync status */}
        <Card title="Data Sync Status" className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm text-gray-600">Last sync: </span>
                <span className="text-sm font-medium">
                  {formatRelativeTime(mockStats.last_sync || "")}
                </span>
              </div>
            </div>
            <Badge variant={mockStats.sync_status === "idle" ? "success" : "warning"}>
              {mockStats.sync_status}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card title="Recent Activity" subtitle="Latest changes to your inventory">
        <Table
          columns={activityColumns}
          data={mockRecentActivity}
          emptyMessage="No recent activity"
        />
      </Card>
    </div>
  );
};
