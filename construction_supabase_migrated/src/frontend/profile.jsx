// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { authApi } from "../lib/supabase";

export default function Profile() {
  // ======= STATE =======
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  const [credentials, setCredentials] = useState({
    username: "",
    currentPassword: "",
  });
  
  const [credSaving, setCredSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  // ======= HELPERS =======
  const loadProfile = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("admin");
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        setProfile({
          name: user.name || "",
          email: user.email || "admin@mantriconstructions.com",
          phone: user.phone || "+91 9876543210",
          address: user.address || "Mumbai, Maharashtra",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCredentialsChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // ======= SAVE PROFILE =======
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update database with new profile data
      const userId = localStorage.getItem("userId") || currentUser.id;

      if (userId && userId !== "main-admin-001") {
        // Update user in database
        await authApi.updateProfile(userId, {
          full_name: profile.name,
          email: profile.email,
          // Note: phone and address aren't in the current schema
          // You might need to add these fields to the users table
        });
      }

      // Update localStorage with new profile data
      const updatedUser = {
        ...currentUser,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      };
      localStorage.setItem("admin", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      alert("Profile details saved successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ======= CHANGE PASSWORD =======
  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (password.new !== password.confirm) {
      alert("New password and confirm password do not match!");
      return;
    }

    setPwdSaving(true);

    try {
      // Get the correct user ID from localStorage
      const userId = localStorage.getItem("userId") || currentUser?.user_id || currentUser?.id;

      if (!userId) {
        alert("User session not found. Please login again.");
        setPwdSaving(false);
        return;
      }

      // All admin password changes go through Supabase database
      await authApi.changePassword(userId, password.current, password.new);
      console.log("Admin password updated via Supabase");
    } catch (error) {
      console.error("Password change error:", error);
      alert(error.message || "Current password is incorrect!");
      setPwdSaving(false);
      return;
    }

    setTimeout(() => {
      alert("Password changed successfully! Please login again with new credentials.");
      setPassword({ current: "", new: "", confirm: "" });
      setPwdSaving(false);
    }, 1000);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700">Manage Details</h2>
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-xs sm:text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading || saving}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Name *</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                disabled={!isEditing || loading}
                className={`w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  (!isEditing || loading) && "bg-gray-100 cursor-not-allowed"
                }`}
                required
              />
            </div>


            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Email *</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                disabled={!isEditing || loading}
                className={`w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  (!isEditing || loading) && "bg-gray-100 cursor-not-allowed"
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                disabled={!isEditing || loading}
                className={`w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  (!isEditing || loading) && "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Address</label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
                disabled={!isEditing || loading}
                className={`w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  (!isEditing || loading) && "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            {isEditing && (
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 sm:py-3 mt-3 text-sm sm:text-base bg-blue-600 text-white font-semibold rounded-lg lg:rounded-xl shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6">Change Password</h2>
          
          {currentUser && currentUser.isMainAdmin && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-xs sm:text-sm font-medium">
                🔐 Main Administrator Account
              </p>
              <p className="text-blue-600 text-xs sm:text-sm mt-1">
                You can update your login credentials. Changes will take effect on next login.
              </p>
            </div>
          )}
          
          <form onSubmit={handlePasswordSave} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Current Password *
              </label>
              <input
                type="password"
                name="current"
                value={password.current}
                onChange={handlePasswordChange}
                placeholder="Your Current Password"
                className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">New Password *</label>
              <input
                type="password"
                name="new"
                value={password.new}
                onChange={handlePasswordChange}
                placeholder="Your New Password"
                className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
                placeholder="Confirm Password"
                className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={pwdSaving}
              className="w-full py-2 sm:py-3 mt-3 text-sm sm:text-base bg-green-600 text-white font-semibold rounded-lg lg:rounded-xl shadow hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {pwdSaving ? "Saving..." : "Change Password"}
            </button>
          </form>
        </div>
        
        {/* Change Username Card - Only for Main Admin */}
        {currentUser && currentUser.isMainAdmin && (
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6">Change Username</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setCredSaving(true);

              // Verify current password through database
              try {
                const usernameToCheck = currentUser?.username || currentUser?.email;
                if (!usernameToCheck) {
                  alert("Username not found in session.");
                  setCredSaving(false);
                  return;
                }
                await authApi.signIn(usernameToCheck, credentials.currentPassword);
              } catch {
                alert("Current password is incorrect!");
                setCredSaving(false);
                return;
              }
              
              try {
                const userId = localStorage.getItem("userId") || currentUser.id;

                // Update username in database
                await authApi.updateProfile(userId, {
                  username: credentials.username
                });

                const updatedUser = { ...currentUser, username: credentials.username };
                localStorage.setItem("admin", JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);

                alert("Username changed successfully!");
                setCredentials({ username: "", currentPassword: "" });
              } catch (err) {
                console.error("Username change error:", err);
                alert("Error changing username: " + err.message);
              } finally {
                setCredSaving(false);
              }
            }} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  New Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleCredentialsChange}
                  placeholder="Enter new username"
                  className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={credentials.currentPassword}
                  onChange={handleCredentialsChange}
                  placeholder="Enter current password"
                  className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-colors"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={credSaving}
                className="w-full py-2 sm:py-3 mt-3 text-sm sm:text-base bg-purple-600 text-white font-semibold rounded-lg lg:rounded-xl shadow hover:bg-purple-700 transition-colors disabled:opacity-60"
              >
                {credSaving ? "Saving..." : "Change Username"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


