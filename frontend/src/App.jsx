import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Upload from "./pages/Upload";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">

        {/* Navbar */}
        <nav className="bg-white/70 backdrop-blur-sm border-b border-blue-100 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              ClearMinutes
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                My Meetings
              </Link>
              <Link
                to="/"
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + New Meeting
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden flex flex-col gap-1.5 p-1"
            >
              <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="sm:hidden mt-3 pb-2 border-t border-blue-100 pt-3 flex flex-col gap-3 px-1">
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                My Meetings
              </Link>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                + New Meeting
              </Link>
            </div>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/processing/:jobId" element={<Processing />} />
          <Route path="/results/:jobId" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}