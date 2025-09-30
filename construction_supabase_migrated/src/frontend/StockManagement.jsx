// src/frontend/StockManagement.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { stocksApi, materialsApi, contractorsApi, vendorsApi } from "../lib/supabase";

export default function StockManagement() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get both projectId and projectName from navigation
  const projectId = location.state?.projectId || location.state?.project?.id;
  const projectName = location.state?.projectName || location.state?.project?.name;

  const handlePrintPDF = () => {
    window.print();
  };

  // ===== Saved stocks from backend (shown in table) =====
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===== Filters (unchanged UI) =====
  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    materials: [],
    type: "",
    contractor: "",
    vendor: "",
  });

  // ===== Lists fetched from your APIs =====
  const [materialsList, setMaterialsList] = useState([]);       // string[]
  const [contractorsList, setContractorsList] = useState([]);   // string[]
  const [vendorsList, setVendorsList] = useState([]);           // string[]
  // Lookup maps for resolving ids -> names
  const [materialsMap, setMaterialsMap] = useState({});         // { [id]: title }
  const [vendorsMap, setVendorsMap] = useState({});
  const [contractorsMap, setContractorsMap] = useState({});
  const [materialPopupOpen, setMaterialPopupOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");

  // ------- Helpers -------
  const pickTitle = (x) => (x?.title || x?.name || x?.label || x?.fullName || "");

  const fmtDate = (dstr) => {
    try {
      const d = new Date(dstr);
      if (Number.isNaN(d.getTime())) return dstr || "-";
      return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
    } catch {
      return dstr || "-";
    }
  };

  const resolveRef = (value, map) => {
    if (!value) return "";
    if (typeof value === "object") {
      const title = pickTitle(value);
      if (title) return title;
      if (value.id && map[value.id]) return map[value.id];
      return "";
    }
    if (map[value]) return map[value];
    return value;
  };

  // Load dropdown lists once
  useEffect(() => {
    const loadData = async () => {
      try {
        // Pass projectId to filter data by project
        const [materials, contractors, vendors] = await Promise.all([
          materialsApi.getAll(projectId),
          contractorsApi.getAll(projectId),
          vendorsApi.getAll(projectId),
        ]);

        // Materials
        const materialList = (Array.isArray(materials) ? materials : []);
        setMaterialsList(materialList.map((x) => pickTitle(x) || "Untitled"));
        const materialMap = {};
        materialList.forEach((x) => {
          if (x?.id) materialMap[x.id] = pickTitle(x) || "Untitled";
        });
        setMaterialsMap(materialMap);

        // Contractors
        const contractorList = (Array.isArray(contractors) ? contractors : []);
        setContractorsList(contractorList.map((x) => pickTitle(x) || "Unnamed Contractor"));
        const contractorMap = {};
        contractorList.forEach((x) => {
          if (x?.id) contractorMap[x.id] = pickTitle(x) || "Unnamed Contractor";
        });
        setContractorsMap(contractorMap);

        // Vendors
        const vendorList = (Array.isArray(vendors) ? vendors : []);
        setVendorsList(vendorList.map((x) => pickTitle(x) || "Unnamed Vendor"));
        const vendorMap = {};
        vendorList.forEach((x) => {
          if (x?.id) vendorMap[x.id] = pickTitle(x) || "Unnamed Vendor";
        });
        setVendorsMap(vendorMap);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [projectId]);

  // Load saved stocks
  const loadStocks = async () => {
    setLoading(true);
    try {
      // Use projectId to filter stocks by project
      const data = await stocksApi.getAll(projectId);

      const flat = (Array.isArray(data) ? data : []).map((doc, idx) => {
        const materialName = resolveRef(doc.material, materialsMap);
        const vendorName = resolveRef(doc.vendor, vendorsMap);
        const contractorName = resolveRef(doc.contractor, contractorsMap);

        return {
          id: doc.id,
          serialId: idx + 1,
          date: fmtDate(doc.date),
          project: doc.project || "-",
          material: materialName || "-",
          type: doc.type || "-",
          vendorName: vendorName || "",
          contractorName: contractorName || "",
          quantity: doc.quantity ?? "-",
          stock: doc.stock ?? "-",
        };
      });

      const uniqueFlat = flat.filter(
        (item, index, self) => self.findIndex(i => i.id === item.id) === index
      );
      setStocks(uniqueFlat);
    } catch (error) {
      console.error("Error loading stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, [materialsMap, vendorsMap, contractorsMap]);

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "materials") {
      let updated = [...filter.materials];
      if (checked) updated.push(value);
      else updated = updated.filter((m) => m !== value);
      setFilter((prev) => ({ ...prev, materials: updated }));
    } else {
      setFilter((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSearch = () => {};
  const handleReset = () => {
    setFilter({
      fromDate: "",
      toDate: "",
      materials: [],
      type: "",
      contractor: "",
      vendor: "",
    });
  };
  const calculatedStocks = useMemo(() => {
  const materialTotals = {}; // store running totals per material

  return stocks
    .sort((a, b) => {
      // Parse dd/mm/yyyy format for sorting
      const parseDate = (dateStr) => {
        const [dd, mm, yy] = (dateStr || "").split("/");
        return new Date(`${yy}-${mm}-${dd}`);
      };
      return parseDate(a.date) - parseDate(b.date);
    })
    .map((entry, idx) => {
      const material = entry.material;

      if (!materialTotals[material]) {
        materialTotals[material] = { stock: 0, totalInward: 0, totalOutward: 0 };
      }

      const qty = Number(entry.quantity || 0);

      if (entry.type === "Inward") {
        materialTotals[material].stock += qty;
        materialTotals[material].totalInward += qty;
      } else if (entry.type === "Outward") {
        materialTotals[material].stock -= qty;
        materialTotals[material].totalOutward += qty;
      }

      return {
        ...entry,
        serialId: idx + 1,
        stock: materialTotals[material].stock,
        totalInward: materialTotals[material].totalInward,
        totalOutward: materialTotals[material].totalOutward,
      };
    });
}, [stocks]);


  const filteredEntries = useMemo(() => {
    const from = filter.fromDate ? new Date(filter.fromDate) : null;
    const to = filter.toDate ? new Date(filter.toDate) : null;

    return calculatedStocks.filter((entry) => {
      const entryDate = (() => {
        const [dd, mm, yy] = (entry.date || "").split("/");
        const iso = `${yy}-${mm}-${dd}`;
        return new Date(iso);
      })();

      const okDate = (!from || entryDate >= from) && (!to || entryDate <= to);
      const okMaterial =
        filter.materials.length === 0 ||
        filter.materials.includes(entry.material);
      const okType = !filter.type || entry.type === filter.type;
      const okVendor =
        !filter.vendor ||
        (entry.type === "Inward" && entry.vendorName === filter.vendor);
      const okContractor =
        !filter.contractor ||
        (entry.type === "Outward" &&
          entry.contractorName === filter.contractor);

      return okDate && okMaterial && okType && okVendor && okContractor;
    });
  }, [calculatedStocks, filter]);

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this stock entry?")) return;
    try {
      await stocksApi.delete(row.id);
      setStocks((prev) => prev.filter((s) => s.id !== row.id));
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Failed to delete");
    }
  };

  const handleEdit = (row) => {
    navigate("/dashboard/add-stock", { state: { editId: row.id, projectName } });
  };

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
          h3 { font-size: 14px; margin-bottom: 8px; }

          /* Page margins */
          @page { margin: 0.5in; }
        }
      `}</style>

    <div className="flex-1 p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100 relative print-area">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Stock Management</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrintPDF}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 no-print"
          >
            📄 Print / Save as PDF
          </button>
          <button
            onClick={() => navigate("/dashboard/add-stock", { state: { projectName } })}
            className="w-full sm:w-auto bg-blue-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base hover:bg-blue-700 transition no-print"
          >
            Add New Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6 no-print">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
          🔍 Filters
        </h3>
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={filter.fromDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 px-2 sm:px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                name="toDate"
                value={filter.toDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 px-2 sm:px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Materials</label>
              <button
                type="button"
                onClick={() => setMaterialPopupOpen(true)}
                className="w-full border border-gray-300 px-2 sm:px-3 py-2 text-sm rounded-lg hover:bg-gray-50 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Select Materials ({filter.materials.length})
              </button>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 px-2 sm:px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Inward">Inward</option>
                <option value="Outward">Outward</option>
              </select>
            </div>
          </div>

          {/* Conditional Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filter.type === "Outward" && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contractor</label>
                <select
                  name="contractor"
                  value={filter.contractor}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 px-2 sm:px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Contractor</option>
                  {contractorsList.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {filter.type === "Inward" && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  name="vendor"
                  value={filter.vendor}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 px-2 sm:px-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Vendor</option>
                  {vendorsList.map((v, idx) => (
                    <option key={idx} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-5 py-2 text-sm rounded-lg hover:bg-blue-700 transition"
            >
              🔍 Search
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 sm:px-5 py-2 text-sm rounded-lg hover:bg-gray-400 transition"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between mb-6 text-sm sm:text-lg font-semibold">
        <span className="text-green-600 bg-green-50 px-3 py-2 rounded-lg shadow-sm text-center sm:text-left">
          📈 Total Inward:{" "}
          <span className="font-bold">{filteredEntries.filter(e => e.type === 'Inward').reduce((acc, curr) => acc + Number(curr.quantity || 0), 0).toLocaleString()}</span>
        </span>
        <span className="text-red-600 bg-red-50 px-3 py-2 rounded-lg shadow-sm text-center sm:text-left">
          📉 Total Outward:{" "}
          <span className="font-bold">{filteredEntries.filter(e => e.type === 'Outward').reduce((acc, curr) => acc + Number(curr.quantity || 0), 0).toLocaleString()}</span>
        </span>
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden lg:block overflow-x-auto bg-white shadow-lg rounded-2xl">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">S.No.</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">Date</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">Project</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">Material</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">Type</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">Vendor/Contractor</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">Quantity</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-left">Stock</th>
              <th className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="text-center px-4 py-6 text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filteredEntries.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center px-4 py-6 text-gray-400 italic">
                  No stocks found.
                </td>
              </tr>
            )}
            {!loading &&
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{entry.serialId}</td>
                  <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{entry.date}</td>
                  <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">{entry.project}</td>
                  <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-medium">{entry.material}</td>
                  <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.type === 'Inward' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm">
                    {entry.type === "Inward" ? entry.vendorName : entry.contractorName}
                  </td>
                  <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold">{entry.quantity}</td>
                 <td className="px-3 xl:px-4 py-3 border text-xs xl:text-sm font-semibold">{entry.stock}</td>
                  <td className="px-3 xl:px-4 py-3 border">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs transition">Edit</button>
                      <button
                        onClick={() => handleDelete(entry)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Tablet Table View - Visible on medium screens */}
      <div className="hidden sm:block lg:hidden overflow-x-auto bg-white shadow-lg rounded-2xl">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700 text-left">Material/Project</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700 text-left">Type/Date</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700 text-left">Quantity/Stock</th>
              <th className="px-2 py-3 border text-xs font-semibold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="text-center px-4 py-6 text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filteredEntries.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center px-4 py-6 text-gray-400 italic">
                  No stocks found.
                </td>
              </tr>
            )}
            {!loading &&
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-2 py-3 border text-xs">
                    <div className="font-medium">{entry.material}</div>
                    <div className="text-gray-500">{entry.project}</div>
                  </td>
                  <td className="px-2 py-3 border text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium block w-fit mb-1 ${
                      entry.type === 'Inward' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {entry.type}
                    </span>
                    <div className="text-gray-500">{entry.date}</div>
                  </td>
                  <td className="px-2 py-3 border text-xs">
                    <div>Qty: <span className="font-semibold">{entry.quantity}</span></div>
                    <div>Stock: <span className="font-semibold">{entry.stock}</span></div>
                  </td>
                  <td className="px-2 py-3 border">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1 py-1 rounded text-xs transition">Edit</button>
                      <button
                        onClick={() => handleDelete(entry)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-1 py-1 rounded text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on small screens */}
      <div className="sm:hidden space-y-4 no-print">
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Loading…
          </div>
        )}
        {!loading && filteredEntries.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 italic">
            No stocks found.
          </div>
        )}
        {!loading &&
          filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{entry.material}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      #{entry.serialId}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      entry.type === 'Inward' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {entry.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition">Edit</button>
                  <button
                    onClick={() => handleDelete(entry)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-800 font-medium">{entry.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Project:</span>
                  <span className="text-gray-800 font-medium">{entry.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="text-gray-800 font-semibold">{entry.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock:</span>
                  <span className="text-gray-800 font-semibold">{entry.stock}</span>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-gray-500 block mb-1">
                    {entry.type === "Inward" ? "Vendor:" : "Contractor:"}
                  </span>
                  <span className="text-gray-800 font-medium">
                    {entry.type === "Inward" ? entry.vendorName : entry.contractorName}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Material Selection Popup */}
      {materialPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] relative">
            <button
              onClick={() => {
                setMaterialPopupOpen(false);
                setMaterialSearch("");
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Select Materials</h3>

            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search materials..."
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {materialsList
                  .filter(material =>
                    material.toLowerCase().includes(materialSearch.toLowerCase())
                  )
                  .map((material, index) => (
                    <label
                      key={index}
                      className="inline-flex items-center space-x-2 border px-2 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        name="materials"
                        value={material}
                        checked={filter.materials.includes(material)}
                        onChange={handleFilterChange}
                        className="w-4 h-4"
                      />
                      <span className="flex-1">{material}</span>
                    </label>
                  ))}
                {materialsList.filter(material =>
                  material.toLowerCase().includes(materialSearch.toLowerCase())
                ).length === 0 && (
                  <div className="text-sm text-gray-500 col-span-2 text-center py-4">
                    {materialSearch ? `No materials found matching "${materialSearch}"` : "No materials found."}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setMaterialPopupOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
