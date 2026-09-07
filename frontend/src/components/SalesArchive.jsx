import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Search,
  Calendar,
  Eye,
  Printer,
  DollarSign,
  ShoppingBag,
  Download,
  X,
} from "lucide-react";

export default function SalesArchive() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/api/invoices");
      setInvoices(res.data);
      setFilteredInvoices(res.data);
    } catch (err) {
      setError("Failed to fetch invoice history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = invoices;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.customerName.toLowerCase().includes(query) ||
          (inv.issuedBy && inv.issuedBy.toLowerCase().includes(query)),
      );
    }

    if (startDate) {
      result = result.filter(
        (inv) => new Date(inv.createdAt) >= new Date(startDate),
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((inv) => new Date(inv.createdAt) <= end);
    }

    setFilteredInvoices(result);
  }, [searchQuery, startDate, endDate, invoices]);

  // Export Filtered Sales History with Salesperson Column & Summary Row
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert("No sales data available to export.");
      return;
    }

    // 1. Column Headers (Added 'Issued By / Salesperson')
    const headers = [
      "Invoice No",
      "Customer Name",
      "Issued By / Salesperson",
      "Date & Time",
      "Items Count",
      "Subtotal (Rs.)",
      "Discount (Rs.)",
      "Net Total (Rs.)",
    ];

    // 2. Individual Invoice Rows
    const rows = filteredInvoices.map((inv) => {
      const subtotalVal = inv.subtotal || inv.totalAmount + (inv.discount || 0);
      return [
        inv.invoiceNumber,
        `"${inv.customerName.replace(/"/g, '""')}"`,
        `"${(inv.issuedBy || "Admin").replace(/"/g, '""')}"`,
        `"${new Date(inv.createdAt).toLocaleString("en-GB")}"`,
        inv.items?.length || 0,
        subtotalVal,
        inv.discount || 0,
        inv.totalAmount,
      ];
    });

    // 3. Grand Total Calculations
    const overallSubtotal = filteredInvoices.reduce(
      (sum, inv) =>
        sum + (inv.subtotal || inv.totalAmount + (inv.discount || 0)),
      0,
    );
    const overallDiscount = filteredInvoices.reduce(
      (sum, inv) => sum + (inv.discount || 0),
      0,
    );
    const overallNetTotal = filteredInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );

    // 4. Create Grand Total Summary Row (Aligned to updated columns)
    const summaryRow = [
      '"OVERALL GRAND TOTAL"',
      '""',
      '""',
      '""',
      filteredInvoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0),
      overallSubtotal,
      overallDiscount,
      overallNetTotal,
    ];

    // 5. Combine Array Structure
    const csvArray = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
      '""', // Empty row separator
      summaryRow.join(","),
    ];

    // 6. Trigger File Download
    const csvContent = "data:text/csv;charset=utf-8," + csvArray.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = filteredInvoices.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0,
  );
  const totalSalesCount = filteredInvoices.length;

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Sales History & Archive
            </h1>
            <p className="text-sm text-gray-500">
              Track earnings, view customer cash memos, and export sales reports
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm shadow"
          >
            <Download size={16} /> Export Sales Report (CSV)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Filtered Total Revenue
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                Rs. {totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Orders Processed
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalSalesCount}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer, salesperson, or invoice #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading invoice history...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Issued By</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 text-center">Items Sold</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      No invoices found matching your search parameters.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-gray-50">
                      <td className="p-4 font-semibold text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 text-gray-800 font-medium">
                        {inv.customerName}
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {inv.issuedBy || "Store Staff"}
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(inv.createdAt).toLocaleString("en-GB")}
                      </td>
                      <td className="p-4 text-center">
                        {inv.items?.length || 0}
                      </td>
                      <td className="p-4 text-right font-bold text-gray-900">
                        Rs. {inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium"
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 no-print"
            >
              <X size={20} />
            </button>

            <div id="printable-modal" className="font-sans text-gray-800">
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  BISMILLAH PAINT & HARDWARE STORE
                </h2>
                <p className="text-xs text-gray-600 italic">
                  Dealers in Master, Berger, ICI Dulux Paints & Hardware
                  Materials
                </p>
                <div className="mt-2 inline-block bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 tracking-widest uppercase">
                  CASH MEMO RECEIPT
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4 border-b pb-3">
                <div>
                  <p>
                    <span className="font-bold text-gray-700">Customer:</span>{" "}
                    {selectedInvoice.customerName}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">
                      Salesperson:
                    </span>{" "}
                    {selectedInvoice.issuedBy || "Store Staff"}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <span className="font-bold text-gray-700">Memo #:</span>{" "}
                    <span className="font-bold text-blue-700">
                      {selectedInvoice.invoiceNumber}
                    </span>
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Date:</span>{" "}
                    {new Date(selectedInvoice.createdAt).toLocaleString(
                      "en-GB",
                    )}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[480px] sm:min-w-0 text-left border-collapse mb-4 text-xs">
                <thead>
                  <tr className="border-y border-slate-900 bg-gray-50 font-bold text-slate-900">
                    <th className="py-2 px-2 text-center w-10">Sr.</th>
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 text-center w-12">Qty</th>
                    <th className="py-2 px-2 text-right w-24">Rate (Rs.)</th>
                    <th className="py-2 px-2 text-right w-24">Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 text-center font-bold text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2 font-medium">{item.name}</td>
                      <td className="py-2 px-2 text-center">{item.quantity}</td>
                      <td className="py-2 px-2 text-right">
                        Rs. {item.price.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-gray-900">
                        Rs. {item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="flex justify-end mb-6 border-t-2 border-slate-900 pt-2">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>
                      Rs.{" "}
                      {(
                        selectedInvoice.subtotal ||
                        selectedInvoice.totalAmount +
                          (selectedInvoice.discount || 0)
                      ).toLocaleString()}
                    </span>
                  </div>

                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Discount:</span>
                      <span>
                        - Rs. {selectedInvoice.discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t pt-1 mt-1">
                    <span>NET TOTAL:</span>
                    <span>
                      Rs. {selectedInvoice.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 text-[10px] text-gray-600 flex justify-between items-end">
                <div>
                  <p className="font-bold uppercase text-gray-700">Terms:</p>
                  <p>Computer tinted shades are non-refundable.</p>
                </div>
                <div className="border-t border-gray-400 w-32 text-center pt-1 font-bold text-gray-700">
                  Authorized Signature
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium shadow"
              >
                <Printer size={16} /> Print Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
