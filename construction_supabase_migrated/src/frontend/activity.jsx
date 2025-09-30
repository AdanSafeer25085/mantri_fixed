import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { activitiesApi } from "../lib/supabase";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch activities from Supabase
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log("🔍 ACTIVITY PAGE - Fetching activities...");
        const data = await activitiesApi.getAll();
        console.log("🔍 ACTIVITY PAGE - ALL ACTIVITIES:", data);
        console.log("🔍 ACTIVITY PAGE - ACTIVITIES COUNT:", data?.length || 0);
        setActivities(data);
      } catch (err) {
        console.error("🔍 ACTIVITY PAGE - ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Add function to refresh activities
  const refreshActivities = async () => {
    setLoading(true);
    try {
      console.log("🔍 ACTIVITY PAGE - Refreshing activities...");
      const data = await activitiesApi.getAll();
      console.log("🔍 ACTIVITY PAGE - REFRESHED ACTIVITIES:", data);
      console.log("🔍 ACTIVITY PAGE - REFRESHED COUNT:", data?.length || 0);
      setActivities(data);
    } catch (err) {
      console.error("🔍 ACTIVITY PAGE - REFRESH ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Listen for when user comes back to this page
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔍 ACTIVITY PAGE - Page focused, refreshing activities");
      refreshActivities();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Redirect to AddActivity page
  const goToAddActivity = () => {
    navigate("/dashboard/add-activity");
  };

  // Handle edit
  const handleEdit = (id) => {
    navigate("/dashboard/add-activity", { state: { editId: id } });
  };

  // Handle toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Deactive" : "Active";

    try {
      await activitiesApi.update(id, { status: newStatus });

      // update state locally
      setActivities((prev) =>
        prev.map((act) =>
          act.id === id ? { ...act, status: newStatus } : act
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not update status");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    try {
      await activitiesApi.delete(id);

      setActivities((prev) => prev.filter((act) => act.id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete activity");
    }
  };

  // ✅ Sort activities alphabetically by title
  const sortedActivities = [...activities].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Activity
        </h1>
        <button
          onClick={goToAddActivity}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#2044E4] text-white rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 w-full sm:w-auto text-sm sm:text-base"
        >
          <FaPlus className="text-sm" />
          <span className="font-medium">Add New Activity</span>
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
            Loading activities...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-red-500">
            {error}
          </div>
        ) : sortedActivities.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400 italic">
            No activities found.
          </div>
        ) : (
          sortedActivities.map((activity, index) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">#{index + 1} - {activity.title}</h3>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                    activity.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-lg">
                <button
                  onClick={() => handleEdit(activity.id)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleToggleStatus(activity.id, activity.status)}
                  className="text-yellow-500 hover:text-yellow-700 p-2"
                >
                  {activity.status === "Active" ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button
                  onClick={() => handleDelete(activity.id)}
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
      <div className="hidden sm:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#F4F6FB]">
              <tr>
                <th className="px-3 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  #
                </th>
                <th className="px-3 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Activity Title
                </th>
                <th className="px-3 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-3 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">
                    Loading activities...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              ) : sortedActivities.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-gray-400 italic text-sm"
                  >
                    No activities found.
                  </td>
                </tr>
              ) : (
                sortedActivities.map((activity, index) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-3 lg:px-6 py-4 text-gray-600 font-medium text-sm">
                      {index + 1}
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-gray-800 text-sm">{activity.title}</td>
                    <td className="px-3 lg:px-6 py-4">
                      <span
                        className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 flex gap-3 lg:gap-4 text-base lg:text-lg">
                      <button
                        onClick={() => handleEdit(activity.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(activity.id, activity.status)}
                        className="text-yellow-500 hover:text-yellow-700 p-1"
                      >
                        {activity.status === "Active" ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
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
