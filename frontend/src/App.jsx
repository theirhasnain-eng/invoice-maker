import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import CreateInvoice from './components/CreateInvoice';
import SalesArchive from './components/SalesArchive';
import ShopkeeperManager from './components/ShopkeeperManager';
// Assuming you have an Inventory component, import it here:
// import Inventory from './components/Inventory';

// Protect routes based on authentication and optional admin requirements
const ProtectedLayout = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If shopkeeper tries to access admin-only routes, redirect to Create Receipt
    return <Navigate to="/create-receipt" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar automatically adapts links according to user.role */}
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          {/* Shared Route */}
          <Route path="/create-receipt" element={<CreateInvoice />} />

          {/* Admin Only Routes */}
          <Route path="/sales-archive" element={<SalesArchive />} />
          <Route path="/manage-shopkeepers" element={<ShopkeeperManager />} />
          {/* <Route path="/inventory" element={<Inventory />} /> */}

          {/* Default Fallback inside dashboard */}
          <Route
            path="*"
            element={
              user.role === 'admin' ? (
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
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Main App Layout */}
      <Route
        path="/*"
        element={<ProtectedLayout allowedRoles={['admin', 'shopkeeper']} />}
      />

      {/* Root Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}