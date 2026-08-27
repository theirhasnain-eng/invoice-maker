import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FilePlus, 
  Package, 
  History, 
  LogOut, 
  User, 
  Store, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

// Import sub-components
import CreateInvoice from './CreateInvoice';
import Inventory from './Inventory';
import SalesArchive from './SalesArchive';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('create-invoice');
  const [user, setUser] = useState({ name: 'Admin User', role: 'admin' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load stored user profile
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear auth credentials
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    // Redirect to login page
    navigate('/login');
  };

  const navItems = [
    { id: 'create-invoice', label: 'Create Invoice', icon: FilePlus },
    { id: 'inventory', label: 'Inventory Stock', icon: Package },
    { id: 'sales-archive', label: 'Sales History', icon: History }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50 no-print">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-slate-900 text-white rounded-md shadow-md focus:outline-none"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transform transition-transform duration-200 ease-in-out no-print ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Shop Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white leading-tight">MY SHOP STORE</h2>
              <span className="text-xs text-slate-400">POS & Inventory</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-full text-slate-300">
                <User size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1 text-xs text-blue-400 capitalize">
                  <ShieldCheck size={12} />
                  <span>{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/20 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'create-invoice' && <CreateInvoice />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'sales-archive' && <SalesArchive />}
      </main>

    </div>
  );
}