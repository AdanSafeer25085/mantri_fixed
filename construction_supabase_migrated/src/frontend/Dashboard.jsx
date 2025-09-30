import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaProjectDiagram,
  FaChartBar,
  FaWarehouse,
  FaFileContract,
  FaUsers,
  FaFileInvoiceDollar,
  FaProjectDiagram as FaNewProject,
  FaRegChartBar,
  FaChevronRight,
} from "react-icons/fa";
import { projectsApi } from "../lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      navigate("/login");
    }
    
    // Fetch real projects from database
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getAll();

        const formattedProjects = (Array.isArray(data) ? data : [])
          .filter(project => project.name && project.name.trim() !== "") // ✅ keep only those with valid name
          .map(project => ({
            id: project.id,
            name: project.name,
            date: project.createdAt
              ? new Date(project.createdAt).toLocaleDateString("en-GB")
              : "N/A",
            status: project.status || "Pending", // ✅ fallback if missing
          }));

        setProjects(formattedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    
    fetchProjects();
  }, [navigate]);

  if (!admin) return null;

  // Check permissions based on admin type
  const hasPermission = (perm) => {
    // Check if user is main admin using role-based system (with username fallback for backward compatibility)
    const isMainAdmin = admin?.isMainAdmin ||
                       (admin?.username === "adil") ||
                       (admin?.username === "admin");

    if (isMainAdmin) {
      return true;
    }
    // For other admins, check permissions normally
    if (Array.isArray(admin.permissions)) {
      return admin.permissions.includes(perm);
    }
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-2 pt-2 sm:px-4 lg:px-8 sm:mt-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-[#155DFC] p-3 sm:p-4 text-center text-white mb-4 sm:mb-6 lg:mb-8 rounded-xl shadow-lg">
        Welcome {admin.name || admin.username} 👋
      </h2>


      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Project List */}
        <div className="bg-white border border-gray-300 shadow-lg rounded-xl p-4 w-full lg:w-[240px] lg:flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Projects</h3>
          <ul className="space-y-2 max-h-[200px] lg:max-h-[400px] overflow-y-auto pr-1">
            {projects.map((project) => (
              <li
                key={project.id}
                className="p-2 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition"
                onClick={() => setSelectedProject(project)}
              >
                <span className="font-medium text-gray-700 text-sm truncate">
                  {project.name}
                </span>
                <FaChevronRight className="text-gray-500 text-sm" />
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top row cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {hasPermission("New Projects") && (
              <div
                onClick={() => navigate("/dashboard/new-project")}
                className="bg-white border border-gray-300 shadow-lg rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center hover:shadow-xl hover:border-blue-500 transition cursor-pointer"
              >
                <FaNewProject className="text-blue-600 text-2xl sm:text-3xl mb-2" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 text-center">New Projects</h3>
              </div>
            )}

            {hasPermission("Finance") && (
              <div
                onClick={() => navigate("/dashboard/project-finance")}
                className="bg-white border border-gray-300 shadow-lg rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center hover:shadow-xl hover:border-green-500 transition cursor-pointer"
              >
                <FaFileInvoiceDollar className="text-green-600 text-2xl sm:text-3xl mb-2" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 text-center">Finance</h3>
              </div>
            )}

            {hasPermission("Reports") && (
              <div
                onClick={() => navigate("/dashboard/reports")}
                className="bg-white border border-gray-300 shadow-lg rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center hover:shadow-xl hover:border-yellow-500 transition cursor-pointer"
              >
                <FaRegChartBar className="text-yellow-600 text-2xl sm:text-3xl mb-2" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 text-center">Reports</h3>
              </div>
            )}
          </div>

          {selectedProject && (
            <>
              {/* Selected Project Info */}
              <div className="bg-white border border-blue-300 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-blue-800">{selectedProject.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Date: {selectedProject.date} • Status:{" "}
                    <span className="font-medium">{selectedProject.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-red-500 hover:text-red-700 text-lg sm:text-xl font-bold self-end sm:self-center"
                  aria-label="Close"
                >
                  ✖
                </button>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Overview */}
                {hasPermission("Project Overview") && (
                  <div
                    className="col-span-1 lg:col-span-1 bg-white border border-gray-300 shadow-md rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center hover:shadow-lg hover:border-indigo-500 transition cursor-pointer min-h-[180px] sm:min-h-[200px]"
                    onClick={() =>
                      navigate("/dashboard/project-overview", {
                        state: { project: selectedProject },
                      })
                    }
                  >
                    <FaProjectDiagram className="text-indigo-600 text-3xl sm:text-4xl mb-2 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 text-center">
                      Project Overview
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm text-center">
                      Date: {selectedProject.date} • Status:{" "}
                      <span className="font-medium">{selectedProject.status}</span>
                    </p>
                  </div>
                )}

                {/* Other sections grid */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {hasPermission("Stock Management") && (
                    <div className="bg-white border border-gray-300 shadow-md rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-yellow-400 transition">
                      <div className="flex items-center mb-2">
                        <FaWarehouse className="text-yellow-500 text-lg sm:text-xl mr-2" />
                        <h3 className="text-base sm:text-lg font-semibold">Onsite</h3>
                      </div>
                      <button
                        className="bg-yellow-50 hover:bg-yellow-100 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium w-full"
                        onClick={() => navigate("/dashboard/stock-management", { state: { projectId: selectedProject.id } })}
                      >
                        Stock Management
                      </button>
                    </div>
                  )}

                  {(hasPermission("Gantt Chart") || hasPermission("Technical Files")) && (
                    <div className="bg-white border border-gray-300 shadow-md rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-green-400 transition">
                      <div className="flex items-center mb-2">
                        <FaChartBar className="text-green-500 text-lg sm:text-xl mr-2" />
                        <h3 className="text-base sm:text-lg font-semibold">Technical</h3>
                      </div>
                      {hasPermission("Gantt Chart") && (
                        <button
                          className="bg-green-50 hover:bg-green-100 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium w-full mb-2"
                          onClick={() => navigate("/dashboard/gantt-chart", { state: { projectId: selectedProject.id } })}
                        >
                          Gantt Chart
                        </button>
                      )}
                      {hasPermission("Technical Files") && (
                        <button
                          className="bg-green-50 hover:bg-green-100 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium w-full"
                          onClick={() => navigate("/dashboard/technical-files", { state: { projectId: selectedProject.id } })}
                        >
                          Technical Files
                        </button>
                      )}
                    </div>
                  )}

                  {hasPermission("Legal Files") && (
                    <div className="bg-white border border-gray-300 shadow-md rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-blue-400 transition">
                      <div className="flex items-center mb-2">
                        <FaFileContract className="text-blue-500 text-lg sm:text-xl mr-2" />
                        <h3 className="text-base sm:text-lg font-semibold">Legal</h3>
                      </div>
                      <button
                        className="bg-blue-50 hover:bg-blue-100 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium w-full"
                        onClick={() => navigate("/dashboard/legal-files", { state: { projectId: selectedProject.id } })}
                      >
                        Legal Files
                      </button>
                    </div>
                  )}

                  {(hasPermission("Customers") || hasPermission("Leads")) && (
                    <div className="bg-white border border-gray-300 shadow-md rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-purple-400 transition">
                      <div className="flex items-center mb-2">
                        <FaUsers className="text-purple-500 text-lg sm:text-xl mr-2" />
                        <h3 className="text-base sm:text-lg font-semibold">Marketing</h3>
                      </div>
                      {hasPermission("Customers") && (
                        <button
                          className="bg-purple-50 hover:bg-purple-100 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium w-full mb-2"
                          onClick={() => navigate("/dashboard/customers", { state: { projectId: selectedProject.id } })}
                        >
                          Customer Records
                        </button>
                      )}
                      {hasPermission("Leads") && (
                        <button
                          className="bg-purple-50 hover:bg-purple-100 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium w-full"
                          onClick={() => navigate("/dashboard/leads", { state: { projectId: selectedProject.id } })}
                        >
                          Leads Records
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
