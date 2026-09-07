import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import CreateInvoice from "./components/CreateInvoice";
import SalesArchive from "./components/SalesArchive";
import ShopkeeperManager from "./components/ShopkeeperManager";
import Inventory from "./components/Inventory"; // 1. Ensure Inventory is imported

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-20 p-2 bg-slate-900 text-white rounded-md shadow-md no-print"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 overflow-y-auto min-w-0 pt-14 lg:pt-0">
        <Routes>
          {/* Shared Route */}
          <Route path="/create-receipt" element={<CreateInvoice />} />

          {/* Admin Only Routes */}
          {user.role === "admin" && (
            <>
              <Route path="/inventory" element={<Inventory />} />{" "}
              {/* 2. Add inventory route */}
              <Route path="/sales-archive" element={<SalesArchive />} />
              <Route
                path="/manage-shopkeepers"
                element={<ShopkeeperManager />}
              />
            </>
          )}

          {/* Fallback Redirect */}
          <Route
            path="*"
            element={
              user.role === "admin" ? (
                <Navigate to="/sales-archive" replace />
              ) : (
                <Navigate to="/create-receipt" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
