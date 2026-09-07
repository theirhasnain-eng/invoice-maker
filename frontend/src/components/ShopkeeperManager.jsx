import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, UserCheck, UserX, AlertCircle, CheckCircle } from 'lucide-react';

export default function ShopkeeperManager() {
  const [shopkeepers, setShopkeepers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchShopkeepers();
  }, []);

  const fetchShopkeepers = async () => {
    try {
      const res = await api.get('/api/auth/shopkeepers');
      setShopkeepers(res.data);
    } catch (err) {
      setError('Failed to fetch shopkeepers list.');
    }
  };

  const handleCreateShopkeeper = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/api/auth/register-shopkeeper', formData);
      setSuccess(`Shopkeeper ${formData.name} created successfully!`);
      setFormData({ name: '', email: '', password: '' });
      fetchShopkeepers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shopkeeper.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/api/auth/toggle-status/${id}`);
      fetchShopkeepers();
    } catch (err) {
      setError('Failed to update account status.');
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Shopkeepers</h1>
        <p className="text-sm text-gray-500">Add new staff members and control billing portal access</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded border-l-4 border-red-500 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded border-l-4 border-green-500 text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleCreateShopkeeper} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <UserPlus size={18} /> Add New Shopkeeper
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm shadow"
        >
          Create Account
        </button>
      </form>

      {/* Shopkeeper Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full min-w-[560px] text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shopkeepers.map((user) => (
              <tr key={user._id}>
                <td className="p-4 font-semibold text-gray-800">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4 text-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleToggleStatus(user._id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold ${
                      user.isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}