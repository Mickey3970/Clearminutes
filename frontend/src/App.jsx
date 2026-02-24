import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import Processing from "./pages/Processing";
import Results from "./pages/Results";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
        <nav className="bg-white/70 backdrop-blur-sm border-b border-blue-100 px-6 py-4 sticky top-0 z-10">
          <a href="/" className="text-xl font-bold text-indigo-600">
            ClearMinutes
          </a>
        </nav>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/processing/:jobId" element={<Processing />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}