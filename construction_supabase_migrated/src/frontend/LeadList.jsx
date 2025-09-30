// src/frontend/LeadList.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { leadsApi } from "../lib/supabase";

export default function LeadList() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const handlePrintPDF = () => {
    window.print();
  };

  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    nextVisit: "",
    leadType: "",
  });

  // Fetch data from Supabase API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = projectId
          ? await leadsApi.getByProject(projectId)
          : await leadsApi.getAll();

        console.log("API response:", data); // ✅ Debug check

        // ✅ Always ensure leads is an array
        setLeads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setLeads([]); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [projectId]);

  // Delete API + update state
  const handleDelete = async (id) => {
    try {
      await leadsApi.delete(id);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      alert("✅ Lead deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Server error while deleting");
    }
  };

  // Navigate to edit lead form
  const handleEdit = (id) => {
    navigate("/dashboard/add-lead", { state: { projectId, editId: id } });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const filteredLeads = leads.filter((lead) => {
    const leadDate = new Date(lead.visit_date);
    const fromDate = filter.fromDate ? new Date(filter.fromDate) : null;
    const toDate = filter.toDate ? new Date(filter.toDate) : null;
    const nextVisit = filter.nextVisit ? new Date(filter.nextVisit) : null;

    return (
      (!fromDate || leadDate >= fromDate) &&
      (!toDate || leadDate <= toDate) &&
      (!nextVisit || new Date(lead.next_visit) <= nextVisit) &&
      (!filter.leadType || lead.lead_type === filter.leadType)
    );
  });

  // Toggle lead conversion flag (example Active/Deactive-style action)
  const toggleConverted = async (id, current) => {
    try {
      await leadsApi.update(id, { is_converted: !current });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, is_converted: !current } : l)));
    } catch (e) {
      console.error(e);
      alert("Failed to toggle converted status");
    }
  };

  if (loading) {
    return <p className="text-center mt-6 text-gray-600 p-4 sm:p-6">Loading leads...</p>;
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
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          Lead Records
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrintPDF}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 no-print"
          >
            📄 Print / Save as PDF
          </button>
          <button
            onClick={() => navigate("/dashboard/add-lead", { state: { projectId } })}
            className="w-full sm:w-auto bg-green-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base hover:bg-green-700 transition no-print"
          >
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            <label className="block mb-1 text-sm font-medium text-gray-700">Next Visit Before</label>
            <input
              type="date"
              name="nextVisit"
              value={filter.nextVisit}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Lead Type</label>
            <select
              name="leadType"
              value={filter.leadType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="New">New</option>
              <option value="Cold">Cold</option>
              <option value="Warm">Warm</option>
              <option value="Hot">Hot</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <button
              onClick={() =>
                setFilter({ fromDate: "", toDate: "", nextVisit: "", leadType: "" })
              }
              className="w-full sm:w-auto bg-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
            >
              Reset
            </button>
            <button
              onClick={() => console.log("Search triggered")}
              className="w-full sm:w-auto bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden lg:block overflow-x-auto bg-white shadow-lg rounded-2xl">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Created Date</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Full Name</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Primary Contact</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Address</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Status</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Budget</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="text-center hover:bg-gray-50">
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-medium">{lead.full_name}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{lead.primary_contact}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm max-w-xs truncate">{lead.address || ''}</td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    lead.status === 'Active' ? 'bg-green-100 text-green-600' :
                    lead.status === 'Contacted' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {lead.status || 'Active'}
                  </span>
                </td>
                <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">
                  ₹{lead.budget ? Number(lead.budget).toLocaleString() : '0'}
                </td>
                <td className="px-3 xl:px-4 py-3 border">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(lead.id)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs transition"
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-xs transition"
                      onClick={() => handleDelete(lead.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center px-4 py-6 border text-gray-500 italic"
                >
                  No leads found
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
            <tr className="text-center">
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Name</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Contact</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Type</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Next Visit</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="text-center hover:bg-gray-50">
                <td className="px-2 py-3 border text-xs">
                  <div className="font-medium">{lead.full_name}</div>
                  <div className="text-gray-500 text-xs">Visit: {lead.visit_date}</div>
                </td>
                <td className="px-2 py-3 border text-xs">{lead.contact_no}</td>
                <td className="px-2 py-3 border text-xs">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    lead.lead_type === 'Hot' ? 'bg-red-100 text-red-600' :
                    lead.lead_type === 'Warm' ? 'bg-yellow-100 text-yellow-600' :
                    lead.lead_type === 'Cold' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {lead.lead_type}
                  </span>
                </td>
                <td className="px-2 py-3 border text-xs">{lead.next_visit}</td>
                <td className="px-2 py-3 border">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => handleEdit(lead.id)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1 py-1 rounded text-xs transition"
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-1 py-1 rounded text-xs transition"
                      onClick={() => handleDelete(lead.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center px-4 py-6 border text-gray-500 italic"
                >
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on small screens */}
      <div className="sm:hidden space-y-4 no-print">
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 italic">
            No leads found
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{lead.full_name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      lead.lead_type === 'Hot' ? 'bg-red-100 text-red-600' :
                      lead.lead_type === 'Warm' ? 'bg-yellow-100 text-yellow-600' :
                      lead.lead_type === 'Cold' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {lead.lead_type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      lead.is_converted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lead.is_converted ? "Converted" : "Not Converted"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(lead.id)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                    onClick={() => handleDelete(lead.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact:</span>
                  <span className="text-gray-800 font-medium">{lead.contact_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Visit Date:</span>
                  <span className="text-gray-800 font-medium">{lead.visit_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Next Visit:</span>
                  <span className="text-gray-800 font-medium">{lead.next_visit}</span>
                </div>
                {lead.note && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-500 block mb-1">Note:</span>
                    <span className="text-gray-800 text-sm">{lead.note}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}


