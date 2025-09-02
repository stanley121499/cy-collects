/**
 * Main App component with routing configuration
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { CardManagement } from "./pages/admin/CardManagement";
import { InventoryBinder } from "./pages/admin/InventoryBinder";
import { Settings } from "./pages/admin/Settings";
import "./output.css";

/**
 * Main application component with routing
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="cards" element={<CardManagement />} />
            <Route path="inventory" element={<InventoryBinder />} />
            <Route path="pricing" element={<div className="p-8 text-center text-gray-500">Pricing page coming soon...</div>} />
            <Route path="sync" element={<div className="p-8 text-center text-gray-500">Data Sync page coming soon...</div>} />
            <Route path="users" element={<div className="p-8 text-center text-gray-500">Users page coming soon...</div>} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Catch all - redirect to admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
