// src/components/MobileMenu.jsx
import { Link } from "react-router-dom";

export default function MobileMenu() {
  return (
    <div className="md:hidden bg-white shadow-lg border-t border-gray-200">
      <div className="p-4 sm:p-6 space-y-1">
        <Link
          to="/"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/activity"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Activity
        </Link>
        <Link
          to="/task"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Task
        </Link>
        <Link
          to="/contractors"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Contractors
        </Link>
        <Link
          to="/vendors"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Vendors
        </Link>
        <Link
          to="/material"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Material
        </Link>
        <Link
          to="/unit"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Unit
        </Link>
        <Link
          to="/admin"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Admin
        </Link>
        <Link
          to="/profile"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        >
          Profile
        </Link>
        <Link
          to="/logout"
          className="flex items-center w-full px-4 py-3 text-sm sm:text-base font-medium rounded-lg hover:bg-red-50 text-red-600 transition-colors border-t border-gray-200 mt-2 pt-4"
        >
          Logout
        </Link>
      </div>
    </div>
  );
}
