import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { adminsApi } from "../lib/supabase";

export default function Admin() {
  const [admins, setAdmins] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const navigate = useNavigate();

  // Get current logged-in admin
  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (stored) {
      setCurrentAdmin(JSON.parse(stored));
    }
  }, []);

  const loadAdmins = async () => {
    try {
      console.log("Loading admins from database...");
      
      const backendAdmins = await adminsApi.getAll();

      if (backendAdmins) {
        console.log("Admins loaded from database:", backendAdmins);
        
        const processedAdmins = Array.isArray(backendAdmins) 
          ? backendAdmins.map(admin => ({
              ...admin,
              name: admin.fullName || admin.name,
              displayPassword: currentAdmin?.isMainAdmin ? admin.plainPassword || "••••••••" : "••••••••"
            }))
          : [];
        
        setAdmins(processedAdmins);
      } else {
        console.error("Failed to load admins");
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      setAdmins([]);
    }
  };

  useEffect(() => {
    // Test localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log('localStorage is working');
    } catch (error) {
      console.error('localStorage is not available:', error);
    }
    
    loadAdmins();
    
    // Listen for storage changes to refresh admin list
    const handleStorageChange = (e) => {
      console.log('Storage change detected:', e.key, e.newValue);
      if (e.key === "systemAdmins") {
        loadAdmins();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Refresh every 5 seconds
    const interval = setInterval(loadAdmins, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const editAdmin = (index) => {
    navigate("/dashboard/admin-form", { state: { admin: admins[index], index } });
  };

  const deleteAdmin = async (index) => {
    const admin = admins[index];

    // Check if this is a main admin that cannot be deleted
    const isMainAdmin = admin?.role === "main_admin" ||
                       admin?.username === "admin" ||
                       admin?.username === "adil";

    if (isMainAdmin) {
      alert("Cannot delete main administrator! Main admins are protected from deletion for security reasons.");
      return;
    }

    // Additional check: prevent deleting the last admin
    if (admins.length <= 1) {
      alert("Cannot delete the last admin! At least one admin must exist to manage the system.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await adminsApi.delete(admin.id);

        console.log("Admin deleted from database");
        alert("Admin deleted successfully!");

        // Reload admins from database
        loadAdmins();
      } catch (error) {
        console.error("Error deleting admin:", error);
        alert("Error deleting admin: " + error.message);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          Manage Admins ({admins.length})
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={loadAdmins}
            className="flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg shadow hover:bg-green-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/dashboard/admin-form")}
            className="flex items-center justify-center w-full sm:w-auto px-3 sm:px-5 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg shadow hover:bg-blue-700 transition"
          >
            <FaPlus className="mr-2" /> Add New Admin
          </button>
        </div>
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-gray-700">#</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-gray-700">Mobile</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-gray-700">Username</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-gray-700">Password</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold text-gray-700">Permissions</th>
              <th className="px-4 xl:px-6 py-3 text-center text-xs xl:text-sm font-semibold text-gray-700">Options</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-gray-400 italic"
                >
                  No admins found.
                </td>
              </tr>
            ) : (
              admins.map((admin, index) => (
                <tr
                  key={admin.id || index}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm font-bold text-blue-600">{index + 1}</td>
                  <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm font-medium">{admin.fullName || admin.name}</td>
                  <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm">{admin.mobile || "Not provided"}</td>
                  <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm">{admin.username}</td>
                  <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm font-mono">{admin.displayPassword || "••••••••"}</td>
                  <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm max-w-xs truncate">
                    {Array.isArray(admin.permissions)
                      ? admin.permissions.join(", ")
                      : admin.permissions || "None"}
                  </td>
                  <td className="px-4 xl:px-6 py-3 flex justify-center space-x-3">
                    <button
                      onClick={() => editAdmin(index)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                    >
                      <FaEdit />
                    </button>
                    {(() => {
                      const isMainAdmin = admin?.role === "main_admin" ||
                                         admin?.username === "admin" ||
                                         admin?.username === "adil";
                      return (
                        <button
                          onClick={() => deleteAdmin(index)}
                          disabled={isMainAdmin}
                          className={`p-1 rounded ${
                            isMainAdmin
                              ? "text-gray-400 cursor-not-allowed opacity-50"
                              : "text-red-600 hover:text-red-800 hover:bg-red-50"
                          }`}
                          title={isMainAdmin ? "Main admin cannot be deleted" : "Delete admin"}
                        >
                          <FaTrash />
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tablet Table View - Visible on medium screens */}
      <div className="hidden sm:block lg:hidden bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Admin</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Access</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Options</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-400 italic"
                >
                  No admins found.
                </td>
              </tr>
            ) : (
              admins.map((admin, index) => (
                <tr
                  key={admin.id || index}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-3 py-3 text-xs">
                    <div className="font-medium">{admin.fullName || admin.name}</div>
                    <div className="text-blue-600 font-bold">#{index + 1}</div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div>{admin.mobile || "Not provided"}</div>
                    <div className="text-gray-500">{admin.username}</div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className="max-w-24 truncate">
                      {Array.isArray(admin.permissions)
                        ? admin.permissions.join(", ")
                        : admin.permissions || "None"}
                    </div>
                  </td>
                  <td className="px-3 py-3 flex justify-center space-x-2">
                    <button
                      onClick={() => editAdmin(index)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                    >
                      <FaEdit />
                    </button>
                    {(() => {
                      const isMainAdmin = admin?.role === "main_admin" ||
                                         admin?.username === "admin" ||
                                         admin?.username === "adil";
                      return (
                        <button
                          onClick={() => deleteAdmin(index)}
                          disabled={isMainAdmin}
                          className={`p-1 rounded ${
                            isMainAdmin
                              ? "text-gray-400 cursor-not-allowed opacity-50"
                              : "text-red-600 hover:text-red-800 hover:bg-red-50"
                          }`}
                          title={isMainAdmin ? "Main admin cannot be deleted" : "Delete admin"}
                        >
                          <FaTrash />
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on small screens */}
      <div className="sm:hidden space-y-4">
        {admins.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 italic">
            No admins found.
          </div>
        ) : (
          admins.map((admin, index) => (
            <div key={admin.id || index} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">
                    {admin.fullName || admin.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-bold">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editAdmin(index)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded"
                  >
                    <FaEdit />
                  </button>
                  {(() => {
                    const isMainAdmin = admin?.role === "main_admin" ||
                                       admin?.username === "admin" ||
                                       admin?.username === "adil";
                    return (
                      <button
                        onClick={() => deleteAdmin(index)}
                        disabled={isMainAdmin}
                        className={`p-2 rounded ${
                          isMainAdmin
                            ? "text-gray-400 cursor-not-allowed opacity-50"
                            : "text-red-600 hover:text-red-800 hover:bg-red-50"
                        }`}
                        title={isMainAdmin ? "Main admin cannot be deleted" : "Delete admin"}
                      >
                        <FaTrash />
                      </button>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mobile:</span>
                  <span className="text-gray-800 font-medium">{admin.mobile || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Username:</span>
                  <span className="text-gray-800 font-medium">{admin.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Password:</span>
                  <span className="text-gray-800 font-mono text-xs">{admin.displayPassword || "••••••••"}</span>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-gray-500 block mb-1">Permissions:</span>
                  <span className="text-gray-800 text-sm">
                    {Array.isArray(admin.permissions)
                      ? admin.permissions.join(", ")
                      : admin.permissions || "None"}
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
