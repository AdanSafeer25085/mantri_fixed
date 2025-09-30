import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { materialsApi, activitiesApi, tasksApi, projectsApi } from "../lib/supabase";

export default function ProjectProgress() {
  const [showMaterialForm, setShowMaterialForm] = useState(null);
  const [materials, setMaterials] = useState({});
  const [formInputs, setFormInputs] = useState({ material: "", qty: "" });
  const [activities, setActivities] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [showExistingMaterials, setShowExistingMaterials] = useState(null);
  const [allTaskMaterials, setAllTaskMaterials] = useState([]);
  const [selectedExistingMaterials, setSelectedExistingMaterials] = useState([]);
  const location = useLocation();
  const projectId = location.state?.projectId;
  const selectedTasks = location.state?.selectedTasks;

  // ✅ Fetch project with selected activities and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch and clean + sort materials
        const materialsData = await materialsApi.getAll();
        const cleaned = (
          Array.isArray(materialsData) ? materialsData : []
        ).map((x) => ({
          id: x?.id,
          title: (x?.title || x?.name || x?.label || "Untitled").trim(),
        }));

        const sorted = cleaned.sort((a, b) => {
          const regex = /^\d/;
          const aNum = regex.test(a.title);
          const bNum = regex.test(b.title);

          if (aNum && !bNum) return -1;
          if (!aNum && bNum) return 1;

          return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        });

        console.log(
          "Sorted materials:",
          sorted.map((m) => m.title)
        ); // debug
        setMaterialOptions(sorted);

        if (selectedTasks && selectedTasks.length > 0) {
          const activitiesData = await activitiesApi.getAll();

          const activityMap = new Map();
          selectedTasks.forEach((task) => {
            const activity = activitiesData.find(
              (a) => a.id === task.activityId
            );
            if (activity) {
              if (!activityMap.has(activity.id)) {
                activityMap.set(activity.id, { ...activity, tasks: [] });
              }
              activityMap.get(activity.id).tasks.push({
                id: task.id,
                title: task.title,
                startDate: "",
                endDate: "",
                days: "",
              });
            }
          });
          setActivities(Array.from(activityMap.values()));
        } else if (projectId) {
          const projectData = await projectsApi.getById(projectId);

          if (projectData.activities) {
            const tasksData = await tasksApi.getAll();

            const selectedActivitiesWithTasks = projectData.activities.map(
              (activity) => {
                const activityTasks = (
                  Array.isArray(tasksData) ? tasksData : []
                )
                  .filter((task) => {
                    const taskActivityId =
                      typeof task.activity === "object"
                        ? task.activity.id
                        : task.activity;
                    return String(taskActivityId) === String(activity.id);
                  })
                  .map((task) => ({
                    ...task,
                    startDate: "",
                    endDate: "",
                    days: "",
                  }));

                return { ...activity, tasks: activityTasks };
              }
            );

            setActivities(selectedActivitiesWithTasks);
          }
        } else {
          const activitiesData = await activitiesApi.getAll();
          const tasksData = await tasksApi.getAll();

          const activitiesWithTasks = (
            Array.isArray(activitiesData) ? activitiesData : []
          ).map((activity) => {
            const activityTasks = (Array.isArray(tasksData) ? tasksData : [])
              .filter((task) => {
                const taskActivityId =
                  typeof task.activity === "object"
                    ? task.activity.id
                    : task.activity;
                return String(taskActivityId) === String(activity.id);
              })
              .map((task) => ({
                ...task,
                startDate: "",
                endDate: "",
                days: "",
              }));

            return { ...activity, tasks: activityTasks };
          });

          setActivities(activitiesWithTasks);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [projectId, selectedTasks]);

  // ✅ Handle add material
  const handleAddMaterial = (taskId) => {
    const { material, qty } = formInputs;
    if (!material || !qty) return;

    let newEntry = { material, qty };
    setMaterials({
      ...materials,
      [taskId]: [...(materials[taskId] || []), newEntry],
    });

    setFormInputs({ material: "", qty: "" });
    setShowMaterialForm(null);
  };

  // Handle showing existing materials
  const handleShowExistingMaterials = (taskId) => {
    // Collect all materials from all tasks
    const allMaterials = [];
    Object.keys(materials).forEach(id => {
      materials[id].forEach(mat => {
        // Check if material already exists in array
        const existing = allMaterials.find(m => m.material === mat.material);
        if (!existing) {
          allMaterials.push({ ...mat, originalQty: mat.qty });
        }
      });
    });
    setAllTaskMaterials(allMaterials);
    setSelectedExistingMaterials(allMaterials.map(m => ({ ...m })));
    setShowExistingMaterials(taskId);
  };

  // Handle adding selected existing materials
  const handleAddExistingMaterials = (taskId) => {
    const materialsToAdd = selectedExistingMaterials.filter(m => m.selected);

    if (materialsToAdd.length === 0) {
      alert("Please select at least one material");
      return;
    }

    const newMaterials = materialsToAdd.map(m => ({
      material: m.material,
      qty: m.qty
    }));

    setMaterials({
      ...materials,
      [taskId]: [...(materials[taskId] || []), ...newMaterials],
    });

    setShowExistingMaterials(null);
    setSelectedExistingMaterials([]);
  };

  // Handle quantity change for existing materials
  const handleExistingMaterialQtyChange = (index, newQty) => {
    setSelectedExistingMaterials(prev =>
      prev.map((mat, i) => i === index ? { ...mat, qty: newQty } : mat)
    );
  };

  // Handle checkbox toggle for existing materials
  const handleExistingMaterialToggle = (index) => {
    setSelectedExistingMaterials(prev =>
      prev.map((mat, i) => i === index ? { ...mat, selected: !mat.selected } : mat)
    );
  };

  // ✅ Handle user input for task details with automatic days calculation
  const handleTaskChange = (id, field, value) => {
    setActivities((prev) =>
      prev.map((activity) => ({
        ...activity,
        tasks: activity.tasks.map((t) => {
          if (t.id === id) {
            const updatedTask = { ...t, [field]: value };

            // Auto-calculate days when both start and end dates are available
            if (field === "startDate" || field === "endDate") {
              const startDate = field === "startDate" ? value : t.startDate;
              const endDate = field === "endDate" ? value : t.endDate;

              if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);

                if (start <= end) {
                  // Calculate difference in days (inclusive)
                  const timeDiff = end.getTime() - start.getTime();
                  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                  updatedTask.days = daysDiff.toString();
                } else {
                  // If end date is before start date, clear days
                  updatedTask.days = "";
                }
              }
            }

            return updatedTask;
          }
          return t;
        }),
      }))
    );
  };

  // ✅ Handle project completion
  const handleSubmitProject = async () => {
    try {
      const existingProject = location.state?.project;

      if (!existingProject || !existingProject.id) {
        alert("No project found. Please start from the beginning.");
        return;
      }

      const updateData = {
        status: "Completed",
        project_details: {
          activities: activities.map((activity) => ({
            ...activity,
            tasks: activity.tasks.map((task) => ({
              ...task,
              materials: materials[task.id] || [],
            })),
          })),
        },
      };

      // Update the existing project instead of creating a new one
      await projectsApi.update(existingProject.id, updateData);

      alert("Project completed and saved successfully!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Error completing project:", err);
      alert("Error completing project");
    }
  };
  /*
  const handleCopyMaterials = (taskId) => {
    // Find the materials of this task
    const materialsToCopy = materials[taskId] || [];
    if (materialsToCopy.length === 0) {
      alert("No materials to copy from this task.");
      return;
    }

    // Ask user for target taskId (can be replaced with dropdown for UX improvement)
    const targetTaskId = prompt(
      "Enter Task ID where you want to copy materials:"
    );

    if (!targetTaskId || targetTaskId === taskId) return;

    setMaterials((prev) => ({
      ...prev,
      [targetTaskId]: [...(prev[targetTaskId] || []), ...materialsToCopy],
    }));

    alert("Materials copied successfully!");
  };
  */

  // Copy table data to clipboard
  const handleCopyTableData = (taskId) => {
    const materialData = materials[taskId] || [];

    if (materialData.length === 0) {
      alert("No materials to copy!");
      return;
    }

    // Create table text format
    let tableText = "Material\tQuantity\n";
    materialData.forEach((material) => {
      tableText += `${material.material}\t${material.qty}\n`;
    });

    // Copy to clipboard
    navigator.clipboard
      .writeText(tableText)
      .then(() => {
        alert("Table data copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy table data");
      });
  };
  const sortedActivities = [...activities]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((activity) => ({
      ...activity,
      tasks: [...activity.tasks].sort((a, b) => a.title.localeCompare(b.title)),
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-700 mb-4 sm:mb-6 lg:mb-8 border-b pb-4">
          Activities & Tasks Progress
        </h2>

        {sortedActivities.map((activity) => (
          <div
            key={activity.id}
            className="mb-6 sm:mb-8 lg:mb-10 border rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition"
          >
            {/* Activity Header */}
            <div className="bg-blue-100 px-4 sm:px-6 py-3 border-b border-blue-200">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-700">
                {activity.title}
              </h3>
            </div>

            {/* Mobile Card View - Visible only on small screens */}
            <div className="block sm:hidden space-y-4 p-4">
              {activity.tasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500 italic">
                  No tasks found for this activity.
                </div>
              ) : (
                activity.tasks.map((task, i) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium">
                            #{i + 1}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 text-base mb-2">
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="block text-gray-500 mb-1">
                          Start Date:
                        </label>
                        <input
                          type="date"
                          value={task.startDate || ""}
                          onChange={(e) =>
                            handleTaskChange(
                              task.id,
                              "startDate",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">
                          End Date:
                        </label>
                        <input
                          type="date"
                          value={task.endDate || ""}
                          onChange={(e) =>
                            handleTaskChange(
                              task.id,
                              "endDate",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">
                          Days (Auto-calculated):
                        </label>
                        <input
                          type="number"
                          placeholder="Auto-calculated"
                          value={task.days || ""}
                          readOnly
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">
                          Progress:
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.performance || 0}
                          onChange={(e) =>
                            handleTaskChange(
                              task.id,
                              "performance",
                              e.target.value
                            )
                          }
                          className="w-full accent-blue-600"
                        />
                        <div className="text-center mt-1 text-blue-600 font-medium text-sm">
                          {task.performance || 0}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow text-sm"
                        onClick={() =>
                          setShowMaterialForm(
                            showMaterialForm === task.id ? null : task.id
                          )
                        }
                      >
                        Add Material
                      </button>

                      {/* Material Form for Mobile */}
                      {showMaterialForm === task.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-3 text-gray-700 text-sm">
                            Add Material
                          </h4>
                          <div className="space-y-3">
                            <select
                              value={formInputs.material}
                              onChange={(e) =>
                                setFormInputs({
                                  ...formInputs,
                                  material: e.target.value,
                                })
                              }
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="">Select Material</option>
                              {materialOptions.length > 0 ? (
                                materialOptions.map((m) => (
                                  <option
                                    key={m.id || m.name}
                                    value={m.name || m.title}
                                  >
                                    {m.name || m.title}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No materials found
                                </option>
                              )}
                            </select>
                            <input
                              type="number"
                              placeholder="Quantity"
                              value={formInputs.qty}
                              onChange={(e) =>
                                setFormInputs({
                                  ...formInputs,
                                  qty: e.target.value,
                                })
                              }
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                            <div className="flex flex-col xs:flex-row gap-2">
                              <button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow text-sm font-medium min-h-[44px] flex items-center justify-center"
                                onClick={() => handleAddMaterial(task.id)}
                              >
                                Add Material
                              </button>
                              <button
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg shadow text-sm font-medium min-h-[44px] flex items-center justify-center"
                                onClick={() => handleShowExistingMaterials(task.id)}
                              >
                                Existing Materials
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-gray-700 text-sm">
                                Added Materials
                              </h4>
                              <button
                                onClick={() => handleCopyTableData(task.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs shadow"
                                title="Copy materials data to clipboard"
                              >
                                📋 Copy
                              </button>
                            </div>
                            <div className="space-y-2">
                              {materials[task.id]?.length ? (
                                materials[task.id].map((m, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white rounded p-2 border text-sm"
                                  >
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Material:
                                      </span>
                                      <span className="font-medium">
                                        {m.material}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Quantity:
                                      </span>
                                      <span className="font-medium">
                                        {m.qty}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-3 text-gray-500 text-sm">
                                  No materials added.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Task Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border p-3">#</th>
                    <th className="border p-3 text-left">Task</th>
                    <th className="border p-3">Start Date</th>
                    <th className="border p-3">End Date</th>
                    <th className="border p-3">Days</th>
                    <th className="border p-3">Performance</th>
                    <th className="border p-3">Materials</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.tasks.map((task, i) => (
                    <React.Fragment key={task.id}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="border p-3 text-center font-medium">
                          {i + 1}
                        </td>
                        <td className="border p-3">{task.title}</td>

                        <td className="border p-2">
                          <input
                            type="date"
                            value={task.startDate || ""}
                            onChange={(e) =>
                              handleTaskChange(
                                task.id,
                                "startDate",
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="date"
                            value={task.endDate || ""}
                            onChange={(e) =>
                              handleTaskChange(
                                task.id,
                                "endDate",
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            placeholder="Auto-calculated"
                            value={task.days || ""}
                            readOnly
                            className="w-full border rounded px-2 py-1 bg-gray-50 text-gray-700"
                            title="Automatically calculated from start and end dates"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.performance || 0}
                            onChange={(e) =>
                              handleTaskChange(
                                task.id,
                                "performance",
                                e.target.value
                              )
                            }
                            className="w-full accent-blue-600"
                          />
                          <div className="text-xs text-center mt-1 text-blue-600 font-medium">
                            {task.performance || 0}%
                          </div>
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
                            onClick={() =>
                              setShowMaterialForm(
                                showMaterialForm === task.id ? null : task.id
                              )
                            }
                          >
                            Add Material
                          </button>
                        </td>
                      </tr>

                      {/* Material Form */}
                      {showMaterialForm === task.id && (
                        <tr>
                          <td colSpan="7" className="p-6 bg-gray-50 border">
                            <h3 className="font-semibold mb-3 text-gray-700">
                              Add Material
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <select
                                value={formInputs.material}
                                onChange={(e) =>
                                  setFormInputs({
                                    ...formInputs,
                                    material: e.target.value,
                                  })
                                }
                                className="border rounded-lg px-4 py-2"
                              >
                                <option value="">Select Material</option>
                                {materialOptions.length > 0 ? (
                                  materialOptions.map((m) => (
                                    <option
                                      key={m.id || m.name}
                                      value={m.name || m.title}
                                    >
                                      {m.name || m.title}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>
                                    No materials found
                                  </option>
                                )}
                              </select>
                              <input
                                type="number"
                                placeholder="Quantity"
                                value={formInputs.qty}
                                onChange={(e) =>
                                  setFormInputs({
                                    ...formInputs,
                                    qty: e.target.value,
                                  })
                                }
                                className="border rounded-lg px-3 py-2"
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow font-medium min-h-[44px] flex items-center justify-center"
                                onClick={() => handleAddMaterial(task.id)}
                              >
                                Add Material
                              </button>
                              <button
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow font-medium min-h-[44px] flex items-center justify-center"
                                onClick={() => handleShowExistingMaterials(task.id)}
                              >
                                Existing Materials
                              </button>
                            </div>
                            <div className="flex justify-between items-center mb-2 mt-4">
                              <h4 className="font-medium text-gray-700">
                                Added Materials
                              </h4>
                              <button
                                onClick={() => handleCopyTableData(task.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs shadow"
                                title="Copy table data to clipboard"
                              >
                                📋 Copy
                              </button>
                            </div>
                            <table className="w-full border mt-2 text-sm">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border p-2">Material</th>
                                  <th className="border p-2">Quantity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {materials[task.id]?.length ? (
                                  materials[task.id].map((m, idx) => (
                                    <tr key={idx}>
                                      <td className="border p-2">
                                        {m.material}
                                      </td>
                                      <td className="border p-2">{m.qty}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan="2"
                                      className="p-3 text-gray-500 text-center"
                                    >
                                      No Material found.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {activity.tasks.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-4 text-center text-gray-500 italic"
                      >
                        No tasks found for this activity.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center text-gray-500 py-12 text-lg">
            No activities found. Please create activities and tasks first.
          </div>
        )}

        {activities.length > 0 && (
          <div className="mt-6 sm:mt-8 lg:mt-10 text-center">
            <button
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 text-base sm:text-lg font-semibold transition"
              onClick={handleSubmitProject}
            >
              Submit Project
            </button>
          </div>
        )}
      </div>

      {/* Existing Materials Modal */}
      {showExistingMaterials && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowExistingMaterials(null)}>
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setShowExistingMaterials(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition z-10"
            >
              ×
            </button>

            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800 pr-8 sm:pr-10">
              Select Existing Materials
            </h3>

            {allTaskMaterials.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                  No existing materials found. Add materials to any task first.
                </p>
                <button
                  onClick={() => setShowExistingMaterials(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 sm:mb-6">
                  {selectedExistingMaterials.map((mat, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={mat.selected || false}
                          onChange={() => handleExistingMaterialToggle(index)}
                          className="w-5 h-5 text-blue-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-sm sm:text-base break-words">
                            {mat.material}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            Original Qty: {mat.originalQty}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-8 sm:ml-0">
                        <label className="text-sm text-gray-600 whitespace-nowrap">Qty:</label>
                        <input
                          type="number"
                          value={mat.qty || ''}
                          onChange={(e) => handleExistingMaterialQtyChange(index, e.target.value)}
                          className="w-16 sm:w-20 border rounded px-2 py-1 text-sm flex-shrink-0"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                  <button
                    onClick={() => {
                      // Select all
                      setSelectedExistingMaterials(prev =>
                        prev.map(m => ({ ...m, selected: true }))
                      );
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm sm:text-base order-1 sm:order-none"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setShowExistingMaterials(null)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm sm:text-base order-3 sm:order-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddExistingMaterials(showExistingMaterials)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm sm:text-base order-2 sm:order-none"
                  >
                    Add Selected
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
