// src/components/TopNavbar.jsx
import { FaBars } from "react-icons/fa";

export default function TopNavbar({ menuOpen, setMenuOpen }) {
  return (
    <>
      {/* Desktop Top Navbar */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 h-14 md:h-16 shadow-lg mb-4">
        <span className="text-white text-base md:text-lg lg:text-xl font-semibold px-4 text-center">
          Welcome to MANTRI CONSTRUCTIONS – Building Excellence Together
        </span>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-3">
          <div className="bg-white text-blue-600 font-bold rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg text-xs sm:text-sm">
            MC
          </div>
          <h1 className="text-white text-sm sm:text-lg font-bold truncate max-w-xs">
            MANTRI CONSTRUCTIONS
          </h1>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white focus:outline-none hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
        >
          <FaBars size={24} className="sm:w-7 sm:h-7" />
        </button>
      </div>
    </>
  );
}
