import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Upload, Trash2, Download } from "lucide-react";
import { activitiesApi, filesApi } from "../lib/supabase";

export default function TechnicalFiles() {
  const location = useLocation();
  const projectId = location.state?.projectId;
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState("");
  const [activities, setActivities] = useState([]);
  const [allowWithoutActivity, setAllowWithoutActivity] = useState(false);

  // Add filters
  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    searchTerm: "",
    activity: "",
    addedBy: ""
  });

  // Fetch activities list
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activitiesApi.getAll();
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Activities fetch error:", err);
      }
    };
    fetchActivities();
  }, []);

  // Fetch technical files list
 useEffect(() => {
  const fetchFiles = async () => {
    try {
      // Use getByCategory to get technical files specifically
      const data = await filesApi.getByCategory('technical');

      // Ensure array and sort by activity alphabetically
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) =>
        (a.activity || "").toLowerCase().localeCompare((b.activity || "").toLowerCase())
      );

      setFiles(sorted);
    } catch (err) {
      console.error("Files fetch error:", err);
    }
  };
  fetchFiles();
}, [projectId]);

  // Upload new file
  const handleUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    if (!activity && !allowWithoutActivity) {
      alert("⚠ Please select an activity or check 'Allow without activity'.");
      return;
    }

    try {
      const userId = localStorage.getItem('userId') || 'admin';
      const fileData = {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        category: 'technical',
        project_id: projectId,
        activity: activity || null,
        uploaded_by: userId,
        file_path: `/uploads/technical/${uploadedFile.name}`
      };
      const savedFile = await filesApi.create(fileData);

      setFiles((prev) => [...prev, savedFile]);
      setActivity("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload file");
    }
  };

  // Delete file
  const handleDelete = async (id) => {
    try {
      await filesApi.delete(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete file");
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

    // Activity filter
    if (filter.activity && file.activity !== filter.activity) return false;

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
      activity: "",
      addedBy: ""
    });
  };

  // Get unique users for filter dropdown
  const uniqueUsers = [...new Set(files.map(file => file.addedBy).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100">
      <h2 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8 lg:mb-10">
        📂 Manage Technical Files
      </h2>

      {/* Upload Section */}
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 lg:mb-10">
        <label className="block mb-2 sm:mb-3 text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
          Select Activity
        </label>
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="border px-3 sm:px-4 py-2 sm:py-3 rounded-xl w-full mb-3 sm:mb-4 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Choose an activity --</option>
          {activities.map((act) => (
            <option key={act.id} value={act.title}>
              {act.title}
            </option>
          ))}
        </select>

        {/* ✅ Checkbox to allow upload without activity */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <input
            id="allowWithoutActivity"
            type="checkbox"
            checked={allowWithoutActivity}
            onChange={(e) => setAllowWithoutActivity(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="allowWithoutActivity" className="text-gray-600 text-sm sm:text-base">
            Allow upload without selecting an activity
          </label>
        </div>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl h-32 sm:h-40 lg:h-48 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
          <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mb-2" />
          <span className="text-gray-600 font-medium text-sm sm:text-base px-4 text-center">
            Click or drag file to upload
          </span>
          <span className="text-gray-400 text-xs sm:text-sm mt-1 text-center">
            Supported: PDF, DOCX, JPG, PNG
          </span>
          <input type="file" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">🔍 Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <label className="block mb-1 text-sm font-medium text-gray-700">Activity</label>
            <select
              name="activity"
              value={filter.activity}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Activities</option>
              {activities.map((act) => (
                <option key={act.id} value={act.title}>{act.title}</option>
              ))}
            </select>
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

      {/* Mobile Card View - Visible only on small screens */}
      <div className="block sm:hidden space-y-4">
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            🚫 No technical files uploaded yet
          </div>
        ) : (
          filteredFiles.map((file, index) => (
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
                  <span className="text-gray-500">Activity:</span>
                  <span className="text-gray-800 font-medium">{file.activity}</span>
                </div>
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
                  className="w-full text-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <button
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm flex items-center justify-center gap-2"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden sm:block bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <tr>
                <th className="px-3 lg:px-4 py-3 text-xs lg:text-sm">#</th>
                <th className="px-3 lg:px-4 py-3 text-xs lg:text-sm">Activity</th>
                <th className="px-3 lg:px-4 py-3 text-xs lg:text-sm">File Name</th>
                <th className="px-3 lg:px-4 py-3 text-xs lg:text-sm">Added By</th>
                <th className="px-3 lg:px-4 py-3 text-xs lg:text-sm">Date</th>
                <th className="px-3 lg:px-4 py-3 text-xs lg:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file, index) => (
                <tr
                  key={file.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-3 lg:px-4 py-3 text-center font-medium text-gray-900 text-xs lg:text-sm">
                    {index + 1}
                  </td>
                  <td className="px-3 lg:px-4 py-3 text-center text-xs lg:text-sm">{file.activity}</td>
                  <td className="px-3 lg:px-4 py-3 text-center text-xs lg:text-sm font-medium max-w-xs truncate">{file.name}</td>
                  <td className="px-3 lg:px-4 py-3 text-center text-xs lg:text-sm">{file.addedBy}</td>
                  <td className="px-3 lg:px-4 py-3 text-center text-xs lg:text-sm">{file.date}</td>
                  <td className="px-3 lg:px-4 py-3">
                    <div className="flex justify-center gap-2 lg:gap-4">
                      <a
                        href={file.url}
                        download={file.name}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded text-xs lg:text-sm font-medium transition"
                      >
                        <Download className="w-3 h-3 lg:w-4 lg:h-4" /> Download
                      </a>
                      <button
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-xs lg:text-sm font-medium transition"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFiles.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    🚫 No technical files uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}