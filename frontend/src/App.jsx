import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
        <nav className="bg-white/70 backdrop-blur-sm border-b border-blue-100 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-indigo-600">
            ClearMinutes
          </a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">
              My Meetings
            </a>
            <a href="/" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
      + New Meeting
    </a>
          </div>
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