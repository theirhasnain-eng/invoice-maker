import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Receipt, Package, Archive, Users, LogOut, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop — mobile only, closes sidebar on tap */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden no-print"
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 max-w-[80vw] bg-slate-900 min-h-screen text-white p-4 flex flex-col justify-between transform transition-transform duration-200 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="mb-8 border-b border-slate-700 pb-4 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-lg">Paint Shop POS</h2>
              <p className="text-xs text-slate-400">
                {user.name} ({user.role === 'admin' ? 'Admin' : 'Shopkeeper'})
              </p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2 text-sm">
            {/* AVAILABLE TO ALL USERS */}
            <Link
              to="/create-receipt"
              onClick={onClose}
              className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800"
            >
              <Receipt size={18} /> Create Receipt
            </Link>

            {/* ADMIN ONLY NAVIGATION */}
            {user.role === 'admin' && (
              <>
                <Link
                  to="/inventory"
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800"
                >
                  <Package size={18} /> Inventory Stock
                </Link>
                <Link
                  to="/sales-archive"
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800"
                >
                  <Archive size={18} /> Sales Archive & Reports
                </Link>
                <Link
                  to="/manage-shopkeepers"
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-800"
                >
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
    </>
  );
}
