// src/frontend/AddStock.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { stocksApi, materialsApi, vendorsApi, contractorsApi } from "../lib/supabase";

export default function AddStock() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;
  const projectName = location.state?.projectName || location.state?.project?.name || "";
  const editId = location.state?.editId;

  // Fetched lists
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);

  // Form state
  const [newStock, setNewStock] = useState({
    date: "",
    project: projectName,
    material: "",
    type: "",
    vendor: "",
    quantity: "",
  });

  // Fetch dropdown data once
  useEffect(() => {
    async function loadLists() {
      try {
        const [mData, vData, cData, sData] = await Promise.all([
          materialsApi.getAll(),
          vendorsApi.getAll(),
          contractorsApi.getAll(),
          stocksApi.getAll(),
        ]);

        // Materials
        const cleaned = (Array.isArray(mData) ? mData : []).map((x) => ({
          id: x?.id,
          title: (x?.title || x?.name || x?.label || "Untitled").trim(),
        }));

        const sorted = cleaned.sort((a, b) => {
          const regex = /^\d/;
          const aNum = regex.test(a.title);
          const bNum = regex.test(b.title);

          if (aNum && !bNum) return -1;
          if (!aNum && bNum) return 1;

          return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        });

        console.log("Sorted materials:", sorted.map((m) => m.title));
        setMaterials(sorted);

        // Vendors
        const cleanedVendors = (Array.isArray(vData) ? vData : []).map((x) => ({
          id: x?.id,
          title: (x?.title || x?.name || x?.label || "Unnamed Vendor").trim(),
        }));

        const sortedVendors = cleanedVendors.sort((a, b) =>
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );

        setVendors(sortedVendors);

        // Contractors
        const cleanedContractors = (Array.isArray(cData) ? cData : []).map((x) => ({
          id: x?.id,
          title: (x?.title || x?.name || x?.label || "Unnamed Contractor").trim(),
        }));

        const sortedContractors = cleanedContractors.sort((a, b) =>
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );

        setContractors(sortedContractors);

        // Stock data for calculations
        setStockData(Array.isArray(sData) ? sData : []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }

    loadLists();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await stocksApi.getAll();
        const src = data.find(stock => stock.id === editId);
        if (src) {
          const materialId = src.material?.id || src.material || "";
          setNewStock({
            date: src.date ? src.date.substring(0, 10) : "",
            project: src.project || "",
            material: materialId,
            type: src.type || "",
            vendor: src.vendor?.id || src.contractor?.id || "",
            quantity: String(src.quantity ?? ""),
          });
          // Calculate stock for the pre-selected material
          if (materialId && stockData.length > 0) {
            calculateCurrentStock(materialId);
          }
        }
      } catch (error) {
        console.error("Error loading stock for editing:", error);
        alert("Failed to load stock entry for editing");
      }
    })();
  }, [editId, stockData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStock((prev) => ({ ...prev, [name]: value }));

    // Calculate current stock when material changes
    if (name === "material" && value) {
      calculateCurrentStock(value);
    }
  };

  // Calculate current stock for selected material
  const calculateCurrentStock = (materialId) => {
    const materialStocks = stockData.filter(
      (stock) => stock.material?.id === materialId || stock.material === materialId
    );

    // Sort by date to calculate running total
    const sortedStocks = materialStocks.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningTotal = 0;
    sortedStocks.forEach((stock) => {
      const qty = Number(stock.quantity || 0);
      if (stock.type === "Inward") {
        runningTotal += qty;
      } else if (stock.type === "Outward") {
        runningTotal -= qty;
      }
    });

    setCurrentStock(Math.max(0, runningTotal)); // Don't show negative stock
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date: newStock.date,
      project: newStock.project.trim(),
      project_id: projectId,
      material_id: newStock.material,
      type: newStock.type,
      quantity: Number(newStock.quantity),
      vendor_id: newStock.type === "Inward" ? newStock.vendor : null,
      contractor_id: newStock.type === "Outward" ? newStock.vendor : null,
    };

    try {
      if (editId) {
        await stocksApi.update(editId, payload);
        alert("Stock updated successfully!");
      } else {
        await stocksApi.create(payload);
        alert("Stock added successfully!");
      }

      setNewStock({
        date: "",
        project: "",
        material: "",
        type: "",
        vendor: "",
        quantity: "",
      });
      navigate("/dashboard/stock-management", { state: { projectId } });
    } catch (error) {
      console.error("Error saving stock:", error);
      alert("Failed to save stock");
    }
  };

  const partyList = newStock.type === "Inward" ? vendors : contractors;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editId ? "Edit Stock Transaction" : "Add Stock Transaction"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Date */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Date*</label>
            <input
              type="date"
              name="date"
              value={newStock.date}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Project*</label>
            <input
              type="text"
              name="project"
              value={newStock.project}
              onChange={handleChange}
              placeholder="Enter Project Name"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Material */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Material*</label>
            <select
              name="material"
              value={newStock.material}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>

            {newStock.material && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <span className="font-medium text-blue-800">
                  Current Stock: <span className="font-bold">{currentStock}</span> units
                </span>
              </div>
            )}
          </div>

          {/* Inward/Outward */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Inward / Outward*
            </label>
            <select
              name="type"
              value={newStock.type}
              onChange={(e) =>
                setNewStock((prev) => ({ ...prev, type: e.target.value, vendor: "" }))
              }
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="Inward">Inward</option>
              <option value="Outward">Outward</option>
            </select>
          </div>

          {/* Vendor/Contractor */}
          {newStock.type && (
            <div className="sm:col-span-2">
              <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                {newStock.type === "Inward" ? "Vendor*" : "Contractor*"}
              </label>
              <select
                name="vendor"
                value={newStock.vendor}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">
                  Select {newStock.type === "Inward" ? "Vendor" : "Contractor"}
                </option>
                {partyList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Quantity*</label>
            <input
              type="number"
              name="quantity"
              value={newStock.quantity}
              onChange={handleChange}
              placeholder="Enter Quantity"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {newStock.type === "Outward" &&
              newStock.quantity &&
              Number(newStock.quantity) > currentStock && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <span className="font-medium text-red-800">
                    ⚠️ Warning: Insufficient stock! Available: {currentStock} units
                  </span>
                </div>
              )}
          </div>

          {/* Buttons */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard/stock-management")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
            >
              {editId ? "Save Changes" : "Add Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
