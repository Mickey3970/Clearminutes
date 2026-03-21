import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../api/client";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-lg animate-pulse">Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">{error}</p>
    </div>
  );

  const { stats, assignees, recent_meetings } = data;

  const statCards = [
    { label: "Total Meetings", value: stats.total_meetings, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Completed", value: stats.completed, color: "text-green-600", bg: "bg-green-50" },
    { label: "Action Items", value: stats.total_action_items, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Decisions Made", value: stats.total_decisions, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Overview of all your meeting activity</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Meeting
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{s.label}</p>
            <p className={`text-4xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Assignee Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Action Items by Person
          </h2>
          {assignees.length === 0 ? (
            <p className="text-gray-400 text-sm">No assignees yet.</p>
          ) : (
            <div className="space-y-3">
              {assignees.map((a) => {
                const max = assignees[0].tasks;
                const pct = Math.round((a.tasks / max) * 100);
                return (
                  <div key={a.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{a.name}</span>
                      <span className="text-gray-400">{a.tasks} task{a.tasks !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Meeting Status Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Meeting Status
          </h2>
          <div className="space-y-4">
            {[
              { label: "Completed", value: stats.completed, color: "bg-green-400" },
              { label: "Processing", value: stats.processing, color: "bg-yellow-400" },
              { label: "Failed", value: stats.failed, color: "bg-red-400" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{s.label}</span>
                  <span className="text-gray-400">{s.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${s.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: stats.total_meetings ? `${(s.value / stats.total_meetings) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Meetings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Recent Meetings
          </h2>
        </div>
        {recent_meetings.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No completed meetings yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent_meetings.map((m) => (
              <div
                key={m.job_id}
                onClick={() => navigate(`/results/${m.job_id}`)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.filename}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(m.created_at).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{m.overview}</p>
                  </div>
                  <div className="flex gap-3 ml-4 text-xs shrink-0">
                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium">
                      {m.action_items} tasks
                    </span>
                    <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">
                      {m.decisions} decisions
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}