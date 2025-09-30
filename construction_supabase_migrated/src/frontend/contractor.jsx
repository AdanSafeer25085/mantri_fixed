// src/pages/Contractors.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { contractorsApi } from "../lib/supabase";

export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const navigate = useNavigate();

  const goToAddContractor = () => {
    navigate("/dashboard/add-contractor");
  };

  // Fetch contractors from API
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const data = await contractorsApi.getAll();
        setContractors(data);
      } catch (err) {
        console.error("Error fetching contractors:", err);
      }
    };
    fetchContractors();
  }, []);

  // Handle edit
  const handleEdit = (id) => {
    navigate("/dashboard/add-contractor", { state: { editId: id } });
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contractor?")) return;

    try {
      await contractorsApi.delete(id);
      setContractors((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting contractor:", err);
      alert("Could not delete contractor");
    }
  };

  // ✅ Sort contractors by activity title alphabetically
  const sortedContractors = [...contractors].sort((a, b) => {
    const titleA = a.activity?.title || "";
    const titleB = b.activity?.title || "";
    return titleA.localeCompare(titleB);
  });

  return (
    <div className="flex-1 p-4 sm:p-6  bg-gray-100 min-h-screen">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Contractors</h1>
        <button
          onClick={goToAddContractor}
          className="flex items-center justify-center px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition w-full sm:w-auto text-sm sm:text-base"
        >
          <FaPlus className="mr-2" /> Add New Contractor
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {sortedContractors.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400 italic">
            No contractors found
          </div>
        ) : (
          sortedContractors.map((contractor, index) => (
            <div key={contractor.id || index} className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-base">#{index + 1} - {contractor.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Activity: {contractor.activity?.title || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                <div><span className="font-medium text-gray-600">PAN:</span> {contractor.pan}</div>
                <div><span className="font-medium text-gray-600">Contact:</span> {contractor.contact}</div>
                <div><span className="font-medium text-gray-600">Bank:</span> {contractor.bank}</div>
                <div><span className="font-medium text-gray-600">Account:</span> {contractor.account_no}</div>
                <div><span className="font-medium text-gray-600">IFSC:</span> {contractor.ifsc}</div>
              </div>

              <div className="flex justify-end gap-4 pt-3 border-t">
                <button
                  onClick={() => handleEdit(contractor.id)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(contractor.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">#</th>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">Activity</th>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">Name</th>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">PAN</th>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">Contact</th>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">Bank</th>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">Account No.</th>
                <th className="px-3 xl:px-6 py-3 text-left text-gray-700 font-semibold text-xs xl:text-sm">IFSC</th>
                <th className="px-3 xl:px-6 py-3 text-center text-gray-700 font-semibold text-xs xl:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedContractors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-400 italic text-sm">
                    No contractors found
                  </td>
                </tr>
              ) : (
                sortedContractors.map((contractor, index) => (
                  <tr key={contractor.id || index} className="hover:bg-gray-50 transition">
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm">{index + 1}</td>
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm">{contractor.activity?.title || "N/A"}</td>
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm font-medium">{contractor.name}</td>
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm">{contractor.pan}</td>
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm">{contractor.contact}</td>
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm">{contractor.bank}</td>
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm">{contractor.account_no}</td>
                    <td className="px-3 xl:px-6 py-3 text-xs xl:text-sm">{contractor.ifsc}</td>
                    <td className="px-3 xl:px-6 py-3 text-center flex gap-2 xl:gap-3 justify-center">
                      <button
                        onClick={() => handleEdit(contractor.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(contractor.id)}
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
      </div>
    </div>
  );
}
