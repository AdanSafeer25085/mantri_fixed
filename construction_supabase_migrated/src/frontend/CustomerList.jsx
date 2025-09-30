// src/frontend/CustomerList.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { customersApi } from "../lib/supabase";

export default function CustomerList() {
  const location = useLocation();
  const projectId = location.state?.projectId;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add filters
  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    searchTerm: "",
    unitNo: "",
    minAmount: "",
    maxAmount: ""
  });

  const handlePrintPDF = () => {
    window.print();
  };

  // Fetch customers from backend API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = projectId
          ? await customersApi.getByProject(projectId)
          : await customersApi.getAll();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [projectId]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await customersApi.delete(id);
      setCustomers(customers.filter((c) => c.id !== id)); // ✅ remove from UI after delete
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  // Toggle Active/Inactive if supported by backend
  const handleToggleStatus = async (id, current) => {
    try {
      await customersApi.update(id, {
        status: current === "Active" ? "Inactive" : "Active",
      });
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: current === "Active" ? "Inactive" : "Active" } : c)));
    } catch (e) {
      console.error("Failed to toggle customer status", e);
      alert("Could not update status");
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const filteredCustomers = customers.filter((customer) => {
    const customerDate = new Date(customer.datetime || customer.created_at);
    const fromDate = filter.fromDate ? new Date(filter.fromDate) : null;
    const toDate = filter.toDate ? new Date(filter.toDate) : null;

    // Date filter
    if (fromDate && customerDate < fromDate) return false;
    if (toDate && customerDate > toDate) return false;

    // Search filter (name, contact, address)
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchesSearch =
        customer.full_name?.toLowerCase().includes(searchLower) ||
        customer.primary_contact?.toLowerCase().includes(searchLower) ||
        customer.address?.toLowerCase().includes(searchLower) ||
        customer.aadhar_no?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Unit number filter
    if (filter.unitNo && customer.unit_no !== filter.unitNo) return false;

    // Amount range filter
    const amount = parseFloat(customer.amount) || 0;
    if (filter.minAmount && amount < parseFloat(filter.minAmount)) return false;
    if (filter.maxAmount && amount > parseFloat(filter.maxAmount)) return false;

    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setFilter({
      fromDate: "",
      toDate: "",
      searchTerm: "",
      unitNo: "",
      minAmount: "",
      maxAmount: ""
    });
  };

  if (loading) {
    return <p className="text-center mt-6 text-gray-600 p-4 sm:p-6">Loading customers...</p>;
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print-hidden { display: none !important; }
          .no-print { display: none !important; }

          /* Remove shadows and rounded corners for print */
          .shadow-lg { box-shadow: none !important; }
          .rounded-2xl, .rounded-xl, .rounded-lg { border-radius: 0 !important; }

          /* Ensure tables fit on page */
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td { page-break-inside: avoid; }

          /* Print typography */
          .print-area { font-size: 12px; line-height: 1.4; }
          h1, h2 { font-size: 18px; margin-bottom: 16px; }

          /* Page margins */
          @page { margin: 0.5in; }
        }
      `}</style>

    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100 print-area">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Customer Records</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrintPDF}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-lg rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 no-print"
          >
            📄 Print / Save as PDF
          </button>
          <button
            onClick={() => navigate("/dashboard/add-customer", { state: { projectId } })}
            className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition no-print"
          >
            + Add New Customer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filter.fromDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filter.toDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              name="searchTerm"
              value={filter.searchTerm}
              onChange={handleFilterChange}
              placeholder="Name, Contact, Aadhar..."
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Unit No</label>
            <input
              type="text"
              name="unitNo"
              value={filter.unitNo}
              onChange={handleFilterChange}
              placeholder="Enter unit number"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Min Amount</label>
            <input
              type="number"
              name="minAmount"
              value={filter.minAmount}
              onChange={handleFilterChange}
              placeholder="Minimum"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Max Amount</label>
            <input
              type="number"
              name="maxAmount"
              value={filter.maxAmount}
              onChange={handleFilterChange}
              placeholder="Maximum"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full bg-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden lg:block overflow-x-auto bg-white shadow-lg rounded-2xl">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Date/Time</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Full Name</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Primary Contact</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Secondary Contact</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Aadhar No</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Address</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Unit No</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="text-center hover:bg-gray-50">
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">
                  {new Date(c.datetime).toLocaleString()}
                </td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-medium">{c.full_name}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{c.primary_contact}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{c.secondary_contact || "-"}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{c.aadhar_no}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{c.address}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{c.unit_no}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold">₹{c.amount}</td>
                <td className="px-3 xl:px-4 py-3 border">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => navigate("/dashboard/add-customer", { state: { projectId, editId: c.id } })}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs xl:text-sm transition"
                    >
                      Edit
                    </button>
                    {c.status && (
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 px-2 py-1 rounded text-xs xl:text-sm transition"
                      >
                        {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    <button
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-xs xl:text-sm transition"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="text-center px-4 py-6 border text-gray-500 italic"
                >
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tablet Table View - Visible on medium screens */}
      <div className="hidden sm:block lg:hidden overflow-x-auto bg-white shadow-lg rounded-2xl">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Name</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Contact</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Unit</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Amount</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="text-center hover:bg-gray-50">
                <td className="px-2 py-3 border text-xs">
                  <div className="font-medium">{c.full_name}</div>
                  <div className="text-gray-500 text-xs">Aadhar: {c.aadhar_no}</div>
                </td>
                <td className="px-2 py-3 border text-xs">
                  <div>{c.primary_contact}</div>
                  {c.secondary_contact && (
                    <div className="text-gray-500">{c.secondary_contact}</div>
                  )}
                </td>
                <td className="px-2 py-3 border text-xs">{c.unit_no}</td>
                <td className="px-2 py-3 border text-xs font-semibold">₹{c.amount}</td>
                <td className="px-2 py-3 border">
                  <button
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-xs transition"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center px-4 py-6 border text-gray-500 italic"
                >
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on small screens */}
      <div className="sm:hidden space-y-4 no-print">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 italic">
            No customers found
          </div>
        ) : (
          customers.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{c.full_name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                      Unit {c.unit_no}
                    </span>
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded font-medium">
                      ₹{c.amount}
                    </span>
                  </div>
                </div>
                <button
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Primary Contact:</span>
                  <span className="text-gray-800 font-medium">{c.primary_contact}</span>
                </div>
                {c.secondary_contact && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Secondary Contact:</span>
                    <span className="text-gray-800 font-medium">{c.secondary_contact}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Aadhar No:</span>
                  <span className="text-gray-800 font-medium">{c.aadhar_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address:</span>
                  <span className="text-gray-800 font-medium text-right ml-2">{c.address}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-500">Date Added:</span>
                  <span className="text-gray-800 text-xs">
                    {new Date(c.datetime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
