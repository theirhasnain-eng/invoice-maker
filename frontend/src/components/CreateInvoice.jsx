import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Plus, Trash2, Printer, Save, AlertCircle } from "lucide-react";

export default function CreateInvoice() {
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedInvoiceNo, setSavedInvoiceNo] = useState("");

  // Pakistani Paint Shop Branding & State
  const [shopInfo] = useState({
    name: "BISMILLAH PAINT & HARDWARE STORE",
    tagline: "Dealers in Master, Berger, ICI Dulux Paints & Hardware Materials",
    address: "Main Commercial Market, Rawalpindi",
    phone: "0300-1234567 / 0312-9876543",
  });

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get("/api/items");
      setAvailableItems(res.data);
    } catch (err) {
      setError("Failed to load paint inventory.");
    }
  };

  const handleAddItem = () => {
    setCart([
      ...cart,
      { itemId: "", name: "", price: 0, quantity: 1, maxStock: 0 },
    ]);
  };

  const handleItemSelect = (index, selectedItemId) => {
    const updatedCart = [...cart];

    if (!selectedItemId) {
      updatedCart[index] = {
        itemId: "",
        name: "",
        price: 0,
        quantity: 1,
        maxStock: 0,
      };
      setCart(updatedCart);
      return;
    }

    const item = availableItems.find((i) => i._id === selectedItemId);
    if (!item) return;

    updatedCart[index] = {
      itemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      maxStock: item.quantity,
    };
    setCart(updatedCart);
  };

  const handleQuantityChange = (index, qty) => {
    const quantity = parseInt(qty) || 1;
    const updatedCart = [...cart];

    if (quantity > updatedCart[index].maxStock) {
      setError(
        `Stock limit exceeded! Only ${updatedCart[index].maxStock} available for ${updatedCart[index].name}`,
      );
      return;
    }

    setError("");
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
  };

  const handleRemoveItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const grandTotal = Math.max(0, subtotal - discount);

  // Combined Save & Auto-Print Handler
  const handleSaveInvoice = async (shouldPrint = false) => {
    if (cart.length === 0) {
      setError("Please add at least one item to generate a receipt.");
      return;
    }

    if (cart.some((item) => !item.itemId)) {
      setError("Please select valid products for all line items.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        customerName: customer.name
          ? `${customer.name} (${customer.phone || "N/A"})`
          : "Walk-in Customer",
        items: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        discount: discount || 0,
      };

      // 1. Save to Database
      const res = await api.post("/api/invoices/create", payload);

      const generatedInvoiceNo = res.data.invoice.invoiceNumber;
      setSavedInvoiceNo(generatedInvoiceNo);
      setSuccess(`Receipt ${generatedInvoiceNo} saved successfully!`);

      // Refresh Live Inventory
      fetchInventory();

      // 2. Automatically Open Browser Print Dialog
      if (shouldPrint) {
        setTimeout(() => {
          window.print();
        }, 300);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save receipt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Controls Bar */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center no-print">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Paint Shop Cash Memo
          </h1>
          <p className="text-xs text-gray-500">
            Pakistani Retail Invoice & Receipt Standard Format
          </p>
        </div>
        <div className="space-x-3">
          {/* <button
            onClick={() => handleSaveInvoice(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded font-medium text-sm shadow disabled:opacity-50"
          >
            <Save size={16} /> Save Receipt Only
          </button> */}
          <button
            onClick={() => handleSaveInvoice(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm shadow disabled:opacity-50"
          >
            <Printer size={16} /> Save & Print Cash Memo
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="max-w-4xl mx-auto mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded flex items-center gap-2 text-sm no-print">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="max-w-4xl mx-auto mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded text-sm no-print">
          {success}
        </div>
      )}

      {/* Printable Receipt Paper Container */}
      <div
        id="printable-area"
        className="max-w-4xl mx-auto bg-white p-8 shadow-md border border-gray-300 font-sans text-gray-800"
      >
        {/* Header - Shop Branding */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
            {shopInfo.name}
          </h1>
          <p className="text-xs font-semibold text-gray-600 italic mb-1">
            {shopInfo.tagline}
          </p>
          <p className="text-xs text-gray-700">
            {shopInfo.address} | Phone: {shopInfo.phone}
          </p>
          <div className="mt-2 inline-block bg-slate-900 text-white text-xs font-bold px-4 py-0.5 tracking-widest uppercase">
            CASH MEMO / BILL RECEIPT
          </div>
        </div>

        {/* Receipt Header Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-4 border-b pb-3">
          {/* Customer Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700 w-24">Customer:</span>
              <input
                type="text"
                placeholder="Name (e.g., Malik Sahab / Contractor)"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-xs px-1 no-print"
              />
              <span className="hidden print:inline font-semibold">
                {customer.name || "Walk-in Customer"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700 w-24">Phone #:</span>
              <input
                type="text"
                placeholder="0300-XXXXXXX"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-xs px-1 no-print"
              />
              <span className="hidden print:inline">
                {customer.phone || "N/A"}
              </span>
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="space-y-1 text-right">
            <p>
              <span className="font-bold text-gray-700">Memo No: </span>
              <span className="font-bold text-blue-700">
                {savedInvoiceNo || "DRAFT-001"}
              </span>
            </p>
            <p>
              <span className="font-bold text-gray-700">Date: </span>
              {new Date().toLocaleDateString("en-GB")}
            </p>
            <div className="flex justify-end items-center gap-2 no-print">
              <span className="font-bold text-gray-700">Payment:</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border rounded px-1 py-0.5 text-xs"
              >
                <option value="Cash">Cash</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <p className="hidden print:block">
              <span className="font-bold text-gray-700">Payment Mode: </span>
              {paymentMethod}
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left border-collapse mb-4">
          <thead>
            <tr className="border-y-2 border-slate-900 bg-gray-50 text-xs font-bold text-slate-900">
              <th className="py-2 px-2 text-center w-12">Sr.</th>
              <th className="py-2 px-2">Item Description / Shade / Brand</th>
              <th className="py-2 px-2 text-center w-16">Qty</th>
              <th className="py-2 px-2 text-right w-24">Rate (Rs.)</th>
              <th className="py-2 px-2 text-right w-28">Amount (Rs.)</th>
              <th className="py-2 w-8 no-print"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {cart.length === 0 ? (
              <tr className="no-print">
                <td colSpan="6" className="py-4 text-center text-gray-400">
                  No paint items added yet. Click "Add Paint Item" below.
                </td>
              </tr>
            ) : (
              cart.map((row, index) => (
                <tr key={index}>
                  <td className="py-2 px-2 text-center font-bold text-gray-600">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={row.itemId}
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                      className="w-full border rounded p-1 text-xs no-print"
                    >
                      <option value="">-- Select Paint / Material --</option>
                      {availableItems.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                          disabled={item.quantity === 0}
                        >
                          {item.name} ({item.category}) -{" "}
                          {item.quantity > 0
                            ? `Stock: ${item.quantity}`
                            : "Out of Stock"}{" "}
                          - Rs. {item.price}
                        </option>
                      ))}
                    </select>
                    <span className="hidden print:inline font-semibold">
                      {row.name}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max={row.maxStock}
                      value={row.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                      className="w-12 border rounded text-center text-xs p-1 no-print"
                    />
                    <span className="hidden print:inline">{row.quantity}</span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    Rs. {row.price.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-gray-900">
                    Rs. {(row.price * row.quantity).toLocaleString()}
                  </td>
                  <td className="py-2 text-center no-print">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Add Product Button */}
        <button
          onClick={handleAddItem}
          className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mb-6 no-print hover:underline"
        >
          <Plus size={14} /> Add Paint Item
        </button>

        {/* Totals Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2 text-xs border-t pt-2">
            <div className="flex justify-between text-gray-700">
              <span>Sub Total:</span>
              <span className="font-semibold">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-700">
              <span>Special Discount (Rs.):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-20 border rounded p-1 text-right text-xs no-print"
              />
              <span className="hidden print:inline">
                Rs. {discount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm font-extrabold text-slate-900">
              <span>NET TOTAL:</span>
              <span>Rs. {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer & Terms */}
        <div className="border-t pt-4 text-[11px] text-gray-600 grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-gray-800 uppercase mb-1">
              Terms & Conditions:
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>
                Goods once sold will not be returned without original receipt.
              </li>
              <li>Tinted computer shades cannot be exchanged or returned.</li>
              <li>
                Please check stock quantity and shades before leaving shop.
              </li>
            </ul>
          </div>

          <div className="text-right flex flex-col justify-between items-end">
            <p className="italic font-semibold text-gray-800">
              Thank you for your business!
            </p>
            <div className="pt-8 border-t border-gray-400 w-36 text-center">
              <p className="font-bold text-gray-800">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
