import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTasks} from "react-icons/fa";
import { activitiesApi, tasksApi, projectsApi } from "../lib/supabase";

export default function AddTask() {
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [performance, setPerformance] = useState(50);
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location.state?.editId;

  // Fetch activities and projects from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesData, projectsData] = await Promise.all([
          activitiesApi.getAll(),
          projectsApi.getAll()
        ]);
        setActivities(activitiesData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Prefill on edit
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await tasksApi.getByActivity(); // Get all tasks and find the one we need
        const task = data.find(t => t.id === editId);
        if (task) {
          setActivity(task.activity?.id || task.activity_id || "");
          setTitle(task.title || "");
          setStatus(task.status || "");
          setProjectId(task.project_id || "");
          setStartDate(task.start_date || "");
          setEndDate(task.end_date || "");
          setDays(task.days || "");
          setPerformance(task.performance || 50);
          setMaterials(task.materials || []);
        }
      } catch (error) {
        console.error("Error loading task:", error);
        alert("Failed to load task for editing");
      }
    })();
  }, [editId]);

  // Auto-calculate days when start/end dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start <= end) {
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
        setDays(daysDiff.toString());
      } else {
        setDays("");
      }
    } else {
      setDays("");
    }
  }, [startDate, endDate]);

  // Save Task API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const taskData = {
        activity_id: activity,
        title,
        status,
        project_id: projectId,
        start_date: startDate,
        end_date: endDate,
        days: parseInt(days) || null,
        performance: parseInt(performance) || 50,
        materials: materials
      };

      let result;
      if (editId) {
        result = await tasksApi.update(editId, taskData);
        console.log("🔍 TASK UPDATED:", result);
      } else {
        result = await tasksApi.create(taskData);
        console.log("🔍 NEW TASK CREATED:", result);
        console.log("🔍 TASK DATA SENT:", taskData);
      }

      // Verify the task was saved by fetching all tasks
      const allTasks = await tasksApi.getAll();
      console.log("🔍 ALL TASKS AFTER SAVE:", allTasks);
      console.log("🔍 TOTAL TASKS COUNT:", allTasks?.length || 0);

      // redirect back to task dashboard
      navigate("/dashboard/task");
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-start justify-center py-6 sm:py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex flex-col sm:flex-row items-center justify-center gap-2">
            <FaTasks className="text-blue-600" />
            <span className="text-center">MANTRI CONSTRUCTIONS</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Add a new task to your dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Activity Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Activity</label>
            <div className="relative">
             
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full pl-10 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                required
              >
                <option value="" disabled>
                  Select activity
                </option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Title</label>
            <div className="relative">
             
              <input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
              required
            >
              <option value="" disabled>
                Select status
              </option>
              <option>Active</option>
              <option>Deactive</option>
            </select>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Project (Optional)</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
            >
              <option value="">No Project (General Task)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
            />
          </div>

          {/* Days (Auto-calculated) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Days (Auto-calculated)</label>
            <input
              type="number"
              value={days}
              readOnly
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm sm:text-base"
              placeholder="Will calculate automatically"
            />
          </div>

          {/* Performance */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Progress (%)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                className="flex-1 accent-blue-600"
              />
              <span className="text-blue-600 font-medium text-sm sm:text-base min-w-[45px]">
                {performance}%
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/task")}
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              {editId ? "Save Changes" : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
