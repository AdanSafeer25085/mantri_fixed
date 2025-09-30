// Original-style AdminForm without complex permissions
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
    role: editingAdmin?.role || "admin",
    username: editingAdmin?.username || "",
    password: editingAdmin?.password || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted with data:", formData);

    try {
      let savedUser;
      let savedAdmin;

      if (editingAdmin) {
        // Update existing admin
        const adminPayload = {
          position: formData.position,
          mobile: formData.mobile,
          status: formData.status,
          role: formData.role,
          plain_password: formData.password
        };
        savedAdmin = await adminsApi.update(editingAdmin.id, adminPayload);

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
        savedUser = await authApi.signUp(
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
          role: formData.role,
          plain_password: formData.password
        };

        savedAdmin = await adminsApi.create(adminPayload);
      }

      console.log("Admin saved successfully:", savedAdmin);

      alert("Admin saved successfully!");
      navigate("/dashboard/admin");
    } catch (error) {
      console.error("Error saving admin:", error);
      alert("Error saving admin: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editingAdmin ? "Edit Admin" : "Add New Admin"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Position"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Mobile No.
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile No."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="admin">Admin</option>
              <option value="main_admin">Main Admin</option>
              <option value="sub_admin">Sub Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={!editingAdmin}
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 mt-6 sm:mt-8">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200"
            >
              {editingAdmin ? "Update Admin" : "Save Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}