import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 right-4 lg:hidden z-10 text-2xl text-blue-600 font-bold bg-white rounded-full px-2 pb-1 shadow-md transition-transform hover:scale-110"
      >
        ☰
      </button>

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 sm:p-6 lg:mr-64">
        <Outlet />
      </div>
    </div>
  );
}
