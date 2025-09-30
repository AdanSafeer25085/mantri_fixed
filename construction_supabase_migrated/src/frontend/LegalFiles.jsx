import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { filesApi } from "../lib/supabase";

export default function LegalFiles() {
  const location = useLocation();
  const projectId = location.state?.projectId;
  const [files, setFiles] = useState([]);
  const [alert, setAlert] = useState(null);

  // Add filters
  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    searchTerm: "",
    addedBy: ""
  });

  // Fetch files from DB when component loads
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // Use getByCategory to get legal files specifically
        const data = await filesApi.getByCategory('legal');
        setFiles(data);
      } catch (err) {
        console.error("Error fetching legal files:", err);
      }
    };
    fetchFiles();
  }, [projectId]);

  // Upload file metadata to DB
  const handleUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      try {
        const userId = localStorage.getItem('userId') || 'admin';
        const fileData = {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          category: 'legal',
          project_id: projectId,
          uploaded_by: userId,
          file_path: `/uploads/legal/${uploadedFile.name}`
        };
        const savedFile = await filesApi.create(fileData);

        setFiles(prev => [...prev, savedFile]);

        // Show success alert
        setAlert({ type: "success", message: "File uploaded successfully!" });
        setTimeout(() => setAlert(null), 3000);
      } catch (err) {
        console.error("Error uploading file:", err);
        setAlert({ type: "error", message: "Failed to upload file!" });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  // Delete from DB
  const handleDelete = async (id) => {
    try {
      await filesApi.delete(id);
      setFiles(prev => prev.filter(f => f.id !== id));

      // Show delete alert
      setAlert({ type: "error", message: "File deleted successfully!" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error("Error deleting file:", err);
      setAlert({ type: "error", message: "Failed to delete file!" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const filteredFiles = files.filter((file) => {
    const fileDate = new Date(file.date || file.created_at);
    const fromDate = filter.fromDate ? new Date(filter.fromDate) : null;
    const toDate = filter.toDate ? new Date(filter.toDate) : null;

    // Date filter
    if (fromDate && fileDate < fromDate) return false;
    if (toDate && fileDate > toDate) return false;

    // Search filter (file name)
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      if (!file.name?.toLowerCase().includes(searchLower)) return false;
    }

    // Added by filter
    if (filter.addedBy && file.addedBy !== filter.addedBy) return false;

    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setFilter({
      fromDate: "",
      toDate: "",
      searchTerm: "",
      addedBy: ""
    });
  };

  // Get unique users for filter dropdown
  const uniqueUsers = [...new Set(files.map(file => file.addedBy).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100">
      <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-center text-blue-700 mb-6">
        📂 Manage Legal Files
      </h2>

      {/* Alert Messages */}
      {alert && (
        <div
          className={`mb-4 p-3 rounded-lg text-center text-white shadow-md text-sm sm:text-base ${
            alert.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700 text-base sm:text-lg">
          Upload File
        </label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl h-32 sm:h-44 cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition duration-300">
          <span className="text-blue-600 font-semibold mb-1 text-sm sm:text-base px-4 text-center">Click or drag file to upload</span>
          <span className="text-gray-500 text-xs sm:text-sm">Supported: PDF, JPG, PNG</span>
          <input type="file" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">🔍 Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <label className="block mb-1 text-sm font-medium text-gray-700">Search Files</label>
            <input
              type="text"
              name="searchTerm"
              value={filter.searchTerm}
              onChange={handleFilterChange}
              placeholder="File name..."
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Added By</label>
            <select
              name="addedBy"
              value={filter.addedBy}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={resetFilters}
            className="bg-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <tr>
              <th className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">#</th>
              <th className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">File Name</th>
              <th className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">Added By</th>
              <th className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">Date</th>
              <th className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file, index) => (
              <tr
                key={file.id}
                className={`text-center transition ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50`}
              >
                <td className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">{index + 1}</td>
                <td className="px-3 lg:px-4 py-3 border text-xs lg:text-sm font-medium text-gray-800 max-w-xs truncate">{file.name}</td>
                <td className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">{file.addedBy}</td>
                <td className="px-3 lg:px-4 py-3 border text-xs lg:text-sm">{file.date}</td>
                <td className="px-3 lg:px-4 py-3 border">
                  <div className="flex justify-center space-x-2 lg:space-x-4">
                    <a
                      href={file.url}
                      download={file.name}
                      className="px-2 lg:px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs lg:text-sm"
                    >
                      Download
                    </a>
                    <button
                      className="px-2 lg:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs lg:text-sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredFiles.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center px-4 py-6 text-gray-500 font-medium"
                >
                  🚫 No files uploaded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on small screens */}
      <div className="sm:hidden space-y-4">
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            🚫 No files uploaded yet
          </div>
        ) : (
          files.map((file, index) => (
            <div key={file.id} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-base mb-1 break-all">
                    {file.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Added By:</span>
                  <span className="text-gray-800 font-medium">{file.addedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-800 font-medium">{file.date}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={file.url}
                  download={file.name}
                  className="w-full text-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                >
                  📥 Download
                </a>
                <button
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                  onClick={() => handleDelete(file.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}