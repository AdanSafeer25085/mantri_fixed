// src/pages/AdminForm.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { adminsApi, authApi } from "../lib/supabase";

export default function AdminForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAdmin = location.state?.admin || null;

  const [formData, setFormData] = useState({
    position: editingAdmin?.position || "",
    name: editingAdmin?.name || "",
    email: editingAdmin?.email || "",
    mobile: editingAdmin?.mobile || "",
    status: editingAdmin?.status || "Active",
    username: editingAdmin?.username || "",
    password: editingAdmin?.password || "",
    permissions: editingAdmin?.permissions ?
      Object.keys({
        newProjects: false,
        finance: false,
        reports: false,
        stockManagement: false,
        ganttChart: false,
        technicalFiles: false,
        legalFiles: false,
        customers: false,
        leads: false,
      }).reduce((acc, key) => {
        const labelMap = {
          newProjects: "New Projects",
          finance: "Finance",
          reports: "Reports",
          stockManagement: "Stock Management",
          ganttChart: "Gantt Chart",
          technicalFiles: "Technical Files",
          legalFiles: "Legal Files",
          customers: "Customers",
          leads: "Leads",
        };
        acc[key] = Array.isArray(editingAdmin.permissions)
          ? editingAdmin.permissions.includes(labelMap[key])
          : false;
        return acc;
      }, {}) : {
        newProjects: false,
        finance: false,
        reports: false,
        stockManagement: false,
        ganttChart: false,
        technicalFiles: false,
        legalFiles: false,
        customers: false,
        leads: false,
      },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [e.target.name]: e.target.checked },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted with data:", formData);

    const labelMap = {
      newProjects: "New Projects",
      finance: "Finance",
      reports: "Reports",
      stockManagement: "Stock Management",
      ganttChart: "Gantt Chart",
      technicalFiles: "Technical Files",
      legalFiles: "Legal Files",
      customers: "Customers",
      leads: "Leads",
    };

    const permissionsArray = Object.entries(formData.permissions)
      .filter(([, checked]) => checked)
      .map(([key]) => labelMap[key] || key);

    const newAdmin = {
      id: editingAdmin?.id || Date.now().toString(),
      position: formData.position,
      name: formData.name,
      fullName: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      status: formData.status,
      username: formData.username,
      password: formData.password, // Send plain text, backend will hash
      permissions: permissionsArray,
      isMainAdmin: false,
      createdAt: editingAdmin?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("New admin object:", newAdmin);

    try {
      if (editingAdmin) {
        // Update existing admin
        const adminPayload = {
          position: formData.position,
          mobile: formData.mobile,
          status: formData.status,
          permissions: permissionsArray,
          plain_password: formData.password
        };
        await adminsApi.update(editingAdmin.id, adminPayload);

        // Also update user info if needed
        const userPayload = {
          full_name: formData.name,
          email: formData.email,
          username: formData.username,
          status: formData.status === "Inactive" ? "Deactive" : formData.status,
        };

        if (formData.password) {
          userPayload.password_hash = formData.password;
        }

        await authApi.updateProfile(editingAdmin.user_id, userPayload);
      } else {
        // Create new user first
        const savedUser = await authApi.signUp(
          formData.email,
          formData.password,
          formData.username,
          formData.name,
          { status: formData.status === "Inactive" ? "Deactive" : formData.status }
        );

        console.log("User created:", savedUser);

        // Then create admin entry
        const adminPayload = {
          user_id: savedUser.id,
          position: formData.position,
          mobile: formData.mobile,
          status: formData.status,
          permissions: permissionsArray,
          plain_password: formData.password
        };

        await adminsApi.create(adminPayload);
      }

      console.log("Admin saved successfully!");

      alert("Admin saved successfully to database!");
      navigate("/dashboard/admin");
    } catch (error) {
      console.error("Error saving admin:", error);
      alert("Error saving admin: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editingAdmin ? "Edit Admin" : "Add New Admin"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Position"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile No."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <div className="sm:col-span-2">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {/* Permissions */}
          <div className="sm:col-span-2 mt-6 sm:mt-8">
            <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-4 sm:mb-6">Permissions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.keys(formData.permissions).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base bg-gray-50 hover:bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition duration-200"
                >
                  <input
                    type="checkbox"
                    name={key}
                    checked={formData.permissions[key]}
                    onChange={handleCheckboxChange}
                    className="accent-blue-600 w-4 h-4"
                  />
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 mt-6 sm:mt-8">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200"
            >
              Save Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
