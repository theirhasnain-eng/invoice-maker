import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Receipt, Package, Archive, Users, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 min-h-screen text-white p-4 flex flex-col justify-between">
      <div>
        <div className="mb-8 border-b border-slate-700 pb-4">
          <h2 className="font-bold text-lg">Paint Shop POS</h2>
          <p className="text-xs text-slate-400">
            {user.name} ({user.role === 'admin' ? 'Admin' : 'Shopkeeper'})
          </p>
        </div>

        <nav className="space-y-2 text-sm">
          {/* AVAILABLE TO ALL USERS */}
          <Link to="/create-receipt" className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800">
            <Receipt size={18} /> Create Receipt
          </Link>

          {/* ADMIN ONLY NAVIGATION */}
          {user.role === 'admin' && (
            <>
              <Link to="/inventory" className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800">
                <Package size={18} /> Inventory Stock
              </Link>
              <Link to="/sales-archive" className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800">
                <Archive size={18} /> Sales Archive & Reports
              </Link>
              <Link to="/manage-shopkeepers" className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800">
                <Users size={18} /> Manage Shopkeepers
              </Link>
            </>
          )}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-2.5 rounded bg-red-600 hover:bg-red-700 w-full text-sm font-semibold"
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}