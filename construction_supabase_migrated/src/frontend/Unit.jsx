// src/pages/Unit.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { unitsApi } from "../lib/supabase";

export default function Unit() {
  const [units, setUnits] = useState([]);
  const navigate = useNavigate();

  const goToAddUnit = () => {
    navigate("/dashboard/add-unit");
  };

  // ✅ Fetch Units from backend API
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await unitsApi.getAll();

        // Map API response to match table structure
        const formattedUnits = data.map((u) => ({
          id: u.id,
          unitName: u.name,
          status: u.status,
        }));

        // ✅ Sort alphabetically by unitName
        formattedUnits.sort((a, b) => a.unitName.localeCompare(b.unitName));

        setUnits(formattedUnits);
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchUnits();
  }, []);

  // ✅ Edit Unit (navigate to edit page)
  const handleEdit = (id) => {
    navigate("/dashboard/add-unit", { state: { editId: id } });
  };

  // ✅ Delete Unit
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;

    try {
      await unitsApi.delete(id);
      setUnits((prev) => prev.filter((unit) => unit.id !== id));
    } catch (err) {
      console.error("Error deleting unit:", err);
      alert("Could not delete unit");
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Units</h1>
        <button
          onClick={goToAddUnit}
          className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-5 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" /> Add New Unit
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">#</th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">Unit Name</th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">Status</th>
                <th className="px-4 lg:px-6 py-3 text-center text-gray-700 font-semibold text-sm lg:text-base">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {units.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400 italic text-sm lg:text-base">
                    No units found
                  </td>
                </tr>
              ) : (
                units.map((unit, index) => (
                  <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base">{index + 1}</td>
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base font-medium">{unit.unitName}</td>
                    <td className="px-4 lg:px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          unit.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(unit.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {units.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 italic">
            No units found
          </div>
        ) : (
          units.map((unit, index) => (
            <div key={unit.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{unit.unitName}</h3>
                  <p className="text-sm text-gray-500">#{index + 1}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(unit.id)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(unit.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600 text-sm">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    unit.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {unit.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
