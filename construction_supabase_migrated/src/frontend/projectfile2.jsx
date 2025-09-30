// src/frontend/Project2file.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClipboardList, Search } from "lucide-react";
import { activitiesApi, tasksApi } from "../lib/supabase";

export default function Project2file() {
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState({});
  const [activityFilters, setActivityFilters] = useState({}); // ✅ individual filters
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const actData = await activitiesApi.getAll();
        console.log("🔍 PROJECT2FILE - ALL ACTIVITIES:", actData);
        console.log("🔍 PROJECT2FILE - ACTIVITIES COUNT:", actData?.length || 0);
        // ✅ Sort activities alphabetically
        setActivities(actData.sort((a, b) => a.title.localeCompare(b.title)));

        const taskData = await tasksApi.getAll();
        console.log("🔍 PROJECT2FILE - ALL TASKS:", taskData);
        console.log("🔍 PROJECT2FILE - TASKS COUNT:", taskData?.length || 0);

        const normalizedTasks = taskData.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          activityId: t.activity?.id || t.activity_id,
          activityTitle: t.activity?.title || "Unknown Activity",
        }));

        // ✅ Sort tasks alphabetically
        setTasks(normalizedTasks.sort((a, b) => a.title.localeCompare(b.title)));
      } catch (err) {
        console.error("Error fetching tasks/activities:", err);
      }
    };

    fetchData();
  }, []);

  const toggleTask = (taskId) => {
    setSelectedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleSaveAndNext = () => {
    const selectedTaskList = tasks.filter((t) => selectedTasks[t.id]);
    navigate("/dashboard/progress", {
      state: {
        selectedTasks: selectedTaskList,
        project: project,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 border-b pb-4 gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-700 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600" />
            <span className="text-center sm:text-left">Select Tasks for Project</span>
          </h1>
        </div>

        {/* Activities & Tasks */}
        {activities.length === 0 ? (
          <p className="text-gray-500 italic text-sm sm:text-base">No activities found.</p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {activities.map((activity) => {
              const relatedTasks = tasks.filter(
                (task) => task.activityId === activity.id
              );

              // ✅ Apply per-activity search filter
              const filterValue = activityFilters[activity.id] || "";
              const filteredTasks = relatedTasks.filter((task) =>
                task.title.toLowerCase().includes(filterValue.toLowerCase())
              );

              return (
                <div
                  key={activity.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Activity Title */}
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 bg-blue-100 px-3 sm:px-4 py-2 rounded-md border-l-4 border-blue-500">
                    {activity.title}
                  </h2>

                  {/* Search inside activity */}
                  <div className="relative mb-4 max-w-full sm:max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Search tasks in this activity..."
                      value={filterValue}
                      onChange={(e) =>
                        setActivityFilters((prev) => ({
                          ...prev,
                          [activity.id]: e.target.value,
                        }))
                      }
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>

                  {/* Tasks */}
                  {filteredTasks.length === 0 ? (
                    <p className="text-gray-400 ml-2 italic text-sm sm:text-base">
                      No tasks for this activity
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredTasks.map((task) => (
                        <label
                          key={task.id}
                          className="flex items-center p-3 bg-white border rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 transition"
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedTasks[task.id]}
                            onChange={() => toggleTask(task.id)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded mr-3 flex-shrink-0"
                          />
                          <span className="text-gray-700 font-medium text-sm sm:text-base break-words">
                            {task.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Save & Next Button */}
        <div className="mt-8 sm:mt-10 flex justify-center sm:justify-end">
          <button
            onClick={handleSaveAndNext}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 font-semibold transition text-sm sm:text-base"
          >
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
}
