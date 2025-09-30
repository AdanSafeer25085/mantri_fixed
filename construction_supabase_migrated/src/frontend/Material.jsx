// src/frontend/Material.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { materialsApi } from "../lib/supabase";

export default function Material() {
  const [materials, setMaterials] = useState([]);

  // Fetch materials from database
  const fetchMaterials = async () => {
    try {
      const data = await materialsApi.getAll();

      // ✅ Sort by activity title alphabetically
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) =>
        (a.activity?.title || "").localeCompare(b.activity?.title || "")
      );

      setMaterials(sorted);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const navigate = useNavigate();

  const goToAddMaterial = () => {
    console.log("Add Material button clicked!");
    console.log("Navigating to add material page");
    navigate("/dashboard/add-material");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await materialsApi.delete(id);
        fetchMaterials(); // Refresh and re-sort
      } catch (err) {
        console.error("Error deleting material:", err);
      }
    }
  };

  const handleEdit = (id) => {
    navigate("/dashboard/add-material", { state: { editId: id } });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          Material
        </h1>
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log("Button clicked - event triggered");
            goToAddMaterial();
          }}
          className="flex items-center justify-center w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg shadow hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" /> Add New Material
        </button>
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700">
                #
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700">
                Activity
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700">
                Unit
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 lg:px-6 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-400 italic text-sm"
                >
                  No materials found.
                </td>
              </tr>
            ) : (
              materials.map((material, index) => (
                <tr
                  key={material.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 lg:px-6 py-3 text-xs lg:text-sm">
                    {index + 1}
                  </td>
                  <td className="px-4 lg:px-6 py-3 text-xs lg:text-sm">
                    {material.activity?.title || "N/A"}
                  </td>
                  <td className="px-4 lg:px-6 py-3 text-xs lg:text-sm">
                    {material.name}
                  </td>
                  <td className="px-4 lg:px-6 py-3 text-xs lg:text-sm">
                    {material.unit?.name || "N/A"}
                  </td>
                  <td
                    className={`px-4 lg:px-6 py-3 text-xs lg:text-sm font-medium ${
                      material.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {material.status}
                  </td>
                  <td className="px-4 lg:px-6 py-3 flex justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => handleEdit(material.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on small screens */}
      <div className="sm:hidden space-y-4">
        {materials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 italic">
            No materials found.
          </div>
        ) : (
          materials.map((material, index) => (
            <div
              key={material.id}
              className="bg-white rounded-lg shadow-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        material.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {material.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">
                    {material.name}
                  </h3>
                </div>
                <div className="flex gap-3 ml-4">
                  <button
                    onClick={() => handleEdit(material.id)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Activity:</span>
                  <span className="text-gray-800 font-medium">
                    {material.activity?.title || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unit:</span>
                  <span className="text-gray-800 font-medium">
                    {material.unit?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
