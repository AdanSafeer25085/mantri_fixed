// src/pages/Vendors.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { vendorsApi } from "../lib/supabase";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const navigate = useNavigate();

  const goToAddVendor = () => {
    navigate("/dashboard/add-vendor");
  };

  // ✅ Fetch vendors from backend API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await vendorsApi.getAll();

        // ✅ Sort vendors alphabetically by name
        const sorted = data.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );

        setVendors(sorted);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    };
    fetchVendors();
  }, []);

  // ✅ Handle edit (navigate to edit page with vendor id)
  const handleEdit = (id) => {
    navigate("/dashboard/add-vendor", { state: { editId: id } });
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      await vendorsApi.delete(id);

      // remove vendor from state (keeping sorted order)
      setVendors((prev) =>
        prev.filter((vendor) => vendor.id !== id).sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        )
      );
    } catch (err) {
      console.error("Error deleting vendor:", err);
      alert("Could not delete vendor");
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          Vendors
        </h1>
        <button
          onClick={goToAddVendor}
          className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-5 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" /> Add New Vendor
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">
                  #
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">
                  Name
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">
                  GST
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">
                  Contact
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">
                  Bank
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">
                  Account No.
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-gray-700 font-semibold text-sm lg:text-base">
                  IFSC
                </th>
                <th className="px-4 lg:px-6 py-3 text-center text-gray-700 font-semibold text-sm lg:text-base">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-gray-400 italic text-sm lg:text-base"
                  >
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((vendor, index) => (
                  <tr
                    key={vendor.id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base">
                      {index + 1}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base font-medium">
                      {vendor.name}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base">
                      {vendor.gst}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base">
                      {vendor.contact}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base">
                      {vendor.bank}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base">
                      {vendor.account_no}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-sm lg:text-base">
                      {vendor.ifsc}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(vendor.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
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
        {vendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 italic">
            No vendors found
          </div>
        ) : (
          vendors.map((vendor, index) => (
            <div
              key={vendor.id || index}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {vendor.name}
                  </h3>
                  <p className="text-sm text-gray-500">#{index + 1}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vendor.id)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">GST:</span>
                  <span className="text-gray-900">{vendor.gst || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Contact:</span>
                  <span className="text-gray-900">
                    {vendor.contact || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Bank:</span>
                  <span className="text-gray-900">{vendor.bank || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Account:</span>
                  <span className="text-gray-900">
                    {vendor.account_no || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">IFSC:</span>
                  <span className="text-gray-900">{vendor.ifsc || "N/A"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
