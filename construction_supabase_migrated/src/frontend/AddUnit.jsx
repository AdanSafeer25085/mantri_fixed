// src/frontend/AddUnit.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { unitsApi } from "../lib/supabase";

export default function AddUnit() {
  const [unitName, setUnitName] = useState("");
  const [status, setStatus] = useState("Active"); // default value
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location.state?.editId;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await unitsApi.update(editId, { name: unitName, status });
        alert("Unit updated successfully!");
      } else {
        await unitsApi.create({ name: unitName, status });
        alert("Unit added successfully!");
      }
      navigate("/dashboard/unit"); // Go back to Units list page
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await unitsApi.getById(editId);
        const src = data?.data || data;
        if (src) {
          setUnitName(src.name || "");
          setStatus(src.status || "Active");
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load unit for editing");
      }
    })();
  }, [editId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editId ? "Edit Unit" : "Add Unit"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Unit Name */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Unit Name*</label>
            <input
              type="text"
              name="unitName"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Status*</label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200"
            >
              {editId ? "Save Changes" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
