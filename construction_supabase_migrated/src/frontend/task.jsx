// src/frontend/Task.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { tasksApi } from "../lib/supabase";

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  // Fetch tasks from backend API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksApi.getAll();

        // ✅ Sort tasks: first by activity title, then by task title
        const sorted = [...data].sort((a, b) => {
          const actA = a.activity?.title?.toLowerCase() || "";
          const actB = b.activity?.title?.toLowerCase() || "";
          if (actA < actB) return -1;
          if (actA > actB) return 1;

          const titleA = a.title?.toLowerCase() || "";
          const titleB = b.title?.toLowerCase() || "";
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;

          return 0;
        });

        setTasks(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  const goToAddTask = () => {
    navigate("/dashboard/addtask");
  };

  // Delete Task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksApi.delete(id);

      // Update state after delete (and re-sort)
      const updated = tasks.filter((task) => task.id !== id).sort((a, b) => {
        const actA = a.activity?.title?.toLowerCase() || "";
        const actB = b.activity?.title?.toLowerCase() || "";
        if (actA < actB) return -1;
        if (actA > actB) return 1;

        const titleA = a.title?.toLowerCase() || "";
        const titleB = b.title?.toLowerCase() || "";
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;

        return 0;
      });

      setTasks(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tasks</h1>
        <button
          onClick={goToAddTask}
          className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
        >
          <FaPlus className="mr-2" /> Add New Task
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500 italic">
            No tasks found
          </div>
        ) : (
          tasks.map((task, index) => (
            <div key={task.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    #{index + 1} - {task.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Activity: {task.activity?.title || "N/A"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ml-2 ${
                    task.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() =>
                    navigate("/dashboard/addtask", { state: { editId: task.id } })
                  }
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
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
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 lg:px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                <th className="px-3 lg:px-4 py-2 text-left text-sm font-medium text-gray-700">Activity</th>
                <th className="px-3 lg:px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
                <th className="px-3 lg:px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-3 lg:px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500 italic text-sm"
                  >
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 lg:px-4 py-2 text-sm">{index + 1}</td>
                    <td className="px-3 lg:px-4 py-2 text-sm">
                      {task.activity?.title || "N/A"}
                    </td>
                    <td className="px-3 lg:px-4 py-2 text-sm">{task.title}</td>
                    <td className="px-3 lg:px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          task.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-2 flex gap-3">
                      <button
                        onClick={() =>
                          navigate("/dashboard/addtask", { state: { editId: task.id } })
                        }
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
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
