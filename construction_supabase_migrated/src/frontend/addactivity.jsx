import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { activitiesApi, projectsApi } from "../lib/supabase";

export default function AddActivity() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location.state?.editId;

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getAll();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const activities = await activitiesApi.getAll();
        const activity = activities.find(a => a.id === editId);
        if (activity) {
          setTitle(activity.title || "");
          setStatus(activity.status || "");
          setProjectId(activity.project_id || "");
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load activity for editing");
      }
    })();
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;
      if (editId) {
        result = await activitiesApi.update(editId, { title, status, project_id: projectId });
        console.log("🔍 ACTIVITY UPDATED:", result);
      } else {
        result = await activitiesApi.create({ title, status, project_id: projectId });
        console.log("🔍 NEW ACTIVITY CREATED:", result);
        console.log("🔍 ACTIVITY DATA SENT:", { title, status, project_id: projectId });
      }

      // Verify the activity was saved by fetching all activities
      const allActivities = await activitiesApi.getAll();
      console.log("🔍 ALL ACTIVITIES AFTER SAVE:", allActivities);
      console.log("🔍 TOTAL ACTIVITIES COUNT:", allActivities?.length || 0);

      navigate("/dashboard/activity");
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Failed to save activity");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4 sm:px-6">
      {/* Form Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            {editId ? "Edit Activity" : "Mantri Constructions"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {editId ? "Update selected activity" : "Add a new activity to your dashboard"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter activity title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
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
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
            >
              <option value="">
                No Project (General Activity)
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/activity")}
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base bg-[#2044E4] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              {editId ? "Save Changes" : "Save Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

