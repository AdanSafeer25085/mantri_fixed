import { useState, useEffect } from "react";
import GanttChart from "../components/Gantchart";
import { projectsApi } from "../lib/supabase";

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7); // Default to 7 days

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getAll();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading Reports...</div>;
  }

  if (projects.length === 0) {
    return <div className="text-center py-10 text-gray-500">No projects found.</div>;
  }

  return (
    <div className="px-4 sm:px-8 py-6 space-y-12 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">Project Reports (All Gantt Charts)</h1>

      {/* Global Days Filter */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📊 Global Report Filter</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="globalDaysFilter" className="text-sm font-medium text-blue-700">
            Show activities for the next:
          </label>
          <input
            id="globalDaysFilter"
            type="number"
            min="1"
            max="365"
            value={daysFilter}
            onChange={(e) => setDaysFilter(parseInt(e.target.value) || 1)}
            className="border border-blue-300 rounded-md px-3 py-2 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Days"
          />
          <span className="text-sm text-blue-600">
            days (applies to all {projects.length} project charts below)
          </span>
        </div>
      </div>

      {projects.map((project) => (
        <div key={project.id} className="bg-gray-50 shadow-lg rounded-2xl p-4 sm:p-6 space-y-4">
          {/* Project Header */}
          <div className="bg-blue-100 p-3 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold">{project.name}</h2>
            <p className="text-sm text-gray-700">
              <strong>Location:</strong> {project.location} |{" "}
              <strong>Status:</strong> {project.status}
            </p>
          </div>

          {/* Gantt Chart for this project */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-base font-semibold mb-3 text-gray-700">
              Project Timeline (Gantt Chart)
            </h3>
            <GanttChart projectId={project.id} daysFilter={daysFilter} minimal={true} />
          </div>
        </div>
      ))}
    </div>
  );
}
