import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  Package,
  X,
  Save,
  CheckCircle,
} from "lucide-react";

export default function ItemManager() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State (Handles both Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    minQuantity: 5,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      setError("Failed to fetch inventory items.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for fresh item creation
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      quantity: "",
      minQuantity: 5,
    });
    setIsModalOpen(true);
  };

  // Open modal populated with existing item data for editing
  const handleOpenEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
    });
    setIsModalOpen(true);
  };

  // Save Item (POST for Create, PUT for Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        minQuantity: parseInt(formData.minQuantity),
      };

      if (editingId) {
        // Update item
        await axios.put(
          `http://localhost:5000/api/items/${editingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSuccess("Item updated successfully!");
      } else {
        // Create new item
        await axios.post("http://localhost:5000/api/items", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("New item added to inventory!");
      }

      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save item.");
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Item deleted successfully.");
      fetchItems();
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  // Filter items by search query and category
  const categories = ["All", ...new Set(items.map((i) => i.category))];
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Inventory & Stock Management
            </h1>
            <p className="text-sm text-gray-500">
              Add, edit, track, and reorder shop products
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow"
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded flex items-center gap-2 text-sm">
            <AlertTriangle size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded flex items-center gap-2 text-sm">
            <CheckCircle size={18} /> {success}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading stock inventory...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Unit Price</th>
                  <th className="p-4 text-center">In Stock</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      No products found. Add your first item using the button
                      above.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isOutOfStock = item.quantity === 0;
                    const isLowStock =
                      item.quantity <= item.minQuantity && !isOutOfStock;

                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-4 font-semibold text-gray-900">
                          {item.name}
                        </td>
                        <td className="p-4 text-gray-600">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="p-4 text-center font-bold text-gray-800">
                          {item.quantity}
                        </td>
                        <td className="p-4 text-center">
                          {isOutOfStock ? (
                            <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                              Low Stock ({item.quantity} left)
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Item"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Wireless Mouse"
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g. Electronics"
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="25.00"
                    className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="50"
                    className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Threshold (For Low Stock Alert)
                </label>
                <input
                  type="number"
                  required
                  value={formData.minQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minQuantity: e.target.value })
                  }
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                >
                  <Save size={16} /> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
