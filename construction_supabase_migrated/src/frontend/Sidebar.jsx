import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaHome, FaTasks, FaClipboardList, FaUsers, FaStore, FaBoxOpen, FaUserShield, FaUser, FaChevronRight, FaChevronDown
} from "react-icons/fa";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  // Auto-close sidebar on route change for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, setIsSidebarOpen]);
  
  const hasPermission = (perm) => {
    if (!currentUser) return false;
    // Check if user is main admin using role-based system (with username fallback)
    const isMainAdmin = currentUser?.isMainAdmin ||
                       (currentUser?.username === "adil") ||
                       (currentUser?.username === "admin");

    if (isMainAdmin) {
      return true;
    }
    // For other admins, check permissions normally
    if (Array.isArray(currentUser.permissions)) {
      return currentUser.permissions.includes(perm);
    }
    return false;
  };

  const handleLogout = () => {
    navigate("/");
    setIsSidebarOpen(false);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? "" : dropdownName);
  };

  const handleNavigation = () => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const menuClass = "flex items-center justify-between w-full px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white transition-colors";

  return (
    <>
      {/* Mobile overlay with blur */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/10 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-screen w-64 bg-gradient-to-b from-blue-700 via-indigo-700 to-purple-700 text-white shadow-lg border-l border-gray-300 transform transition-transform duration-300 z-40
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 border-b border-white/20 px-4">
          <div className="flex items-center">
            <div className="bg-white text-blue-700 font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md">
              MC
            </div>
            <span className="ml-3 font-bold text-lg tracking-wide">MANTRI</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white text-2xl font-bold hover:text-gray-200 transition-colors lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Home */}
          <Link
            to="/dashboard"
            onClick={handleNavigation}
            className="flex items-center justify-between px-4 py-2 rounded-md font-bold text-white hover:bg-blue-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FaHome /> <span>Home</span>
            </div>
          </Link>

          {/* Work Activity */}
          {(hasPermission("Activities") || hasPermission("Tasks")) && (
            <div>
              <button
                onClick={() => toggleDropdown("work")}
                className={menuClass}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <FaTasks /> <span>Work Activity</span>
                </div>
                {openDropdown === "work" ? <FaChevronDown /> : <FaChevronRight />}
              </button>
              {openDropdown === "work" && (
                <div className="ml-6 mt-1 space-y-1">
                  {hasPermission("Activities") && (
                    <Link
                      to="/dashboard/activity"
                      onClick={handleNavigation}
                      className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                    >
                      Activity
                    </Link>
                  )}
                  {hasPermission("Tasks") && (
                    <Link
                      to="/dashboard/task"
                      onClick={handleNavigation}
                      className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                    >
                      Task
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Agencies */}
          {(hasPermission("Contractors") || hasPermission("Vendors")) && (
            <div>
              <button
                onClick={() => toggleDropdown("agencies")}
                className={menuClass}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <FaUsers /> <span>Agencies</span>
                </div>
                {openDropdown === "agencies" ? <FaChevronDown /> : <FaChevronRight />}
              </button>
              {openDropdown === "agencies" && (
                <div className="ml-6 mt-1 space-y-1">
                  {hasPermission("Contractors") && (
                    <Link
                      to="/dashboard/contractors"
                      onClick={handleNavigation}
                      className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                    >
                      Contractors
                    </Link>
                  )}
                  {hasPermission("Vendors") && (
                    <Link
                      to="/dashboard/vendors"
                      onClick={handleNavigation}
                      className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                    >
                      Vendors
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Inventory */}
          {(hasPermission("Materials") || hasPermission("Units")) && (
            <div>
              <button
                onClick={() => toggleDropdown("inventory")}
                className={menuClass}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <FaStore /> <span>Inventory</span>
                </div>
                {openDropdown === "inventory" ? <FaChevronDown /> : <FaChevronRight />}
              </button>
              {openDropdown === "inventory" && (
                <div className="ml-6 mt-1 space-y-1">
                  {hasPermission("Materials") && (
                    <Link
                      to="/dashboard/material"
                      onClick={handleNavigation}
                      className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                    >
                      Material
                    </Link>
                  )}
                  {hasPermission("Units") && (
                    <Link
                      to="/dashboard/unit"
                      onClick={handleNavigation}
                      className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                    >
                      Unit
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manage */}
          <div>
            <button
              onClick={() => toggleDropdown("manage")}
              className={menuClass}
            >
              <div className="flex items-center space-x-2 font-bold">
                <FaUserShield /> <span>Manage</span>
              </div>
              {openDropdown === "manage" ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            {openDropdown === "manage" && (
              <div className="ml-6 mt-1 space-y-1">
                {hasPermission("Admin Management") && (
                  <Link
                    to="/dashboard/admin"
                    onClick={handleNavigation}
                    className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                  >
                    Role Management
                  </Link>
                )}
                <Link
                  to="/dashboard/profile"
                  onClick={handleNavigation}
                  className="block px-4 py-2 rounded-md text-white hover:bg-blue-800 transition-colors"
                >
                  Admin Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-md text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
