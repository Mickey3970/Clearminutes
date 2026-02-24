import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJob, exportJob } from "../api/client";

function Section({ title, children }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 p-6 mb-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Badge({ level }) {
  const colors = {
    high: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[level] || colors.low}`}>
      {level}
    </span>
  );
}

export default function Results() {
  const { jobId } = useParams();
  const [result, setResult] = useState(null);
  const [filename, setFilename] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showLowConf, setShowLowConf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJob(jobId).then((res) => {
      setResult(res.data.result);
      setFilename(res.data.filename);
      setLoading(false);
    });
  }, [jobId]);

  const copyToClipboard = () => {
    const r = result;
    const text = [
      `MEETING MINUTES — ${filename}`,
      "",
      "OVERVIEW",
      r.overview,
      "",
      "KEY POINTS",
      ...r.key_points.map((p) => `• ${p}`),
      "",
      "DECISIONS",
      ...(r.decisions.length ? r.decisions.map((d) => `• ${d}`) : ["None recorded"]),
      "",
      "OPEN QUESTIONS",
      ...(r.open_questions.length ? r.open_questions.map((q) => `• ${q}`) : ["None recorded"]),
      "",
      "ACTION ITEMS",
      ...(r.action_items.length
        ? r.action_items.map(
            (a) =>
              `• ${a.task}${a.assignee ? ` (${a.assignee})` : ""}${a.deadline ? ` — ${a.deadline}` : ""}`
          )
        : ["None recorded"]),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const visibleActions = result.action_items.filter(
    (a) => showLowConf || a.confidence !== "low"
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meeting Minutes</h1>
          <p className="text-gray-400 text-sm mt-1">{filename}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy as Text"}
          </button>
          <button
            onClick={() => exportJob(jobId)}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Export Markdown
          </button>
        </div>
      </div>

      {/* Overview */}
      <Section title="Overview">
        <p className="text-gray-700 leading-relaxed">{result.overview}</p>
      </Section>

      {/* Key Points */}
      <Section title="Key Discussion Points">
        {result.key_points.length ? (
          <ul className="space-y-2">
            {result.key_points.map((p, i) => (
              <li key={i} className="flex gap-2 text-gray-700 text-sm">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">None recorded</p>
        )}
      </Section>

      {/* Decisions */}
      <Section title="Decisions Made">
        {result.decisions.length ? (
          <ul className="space-y-2">
            {result.decisions.map((d, i) => (
              <li key={i} className="flex gap-2 text-gray-700 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">None recorded</p>
        )}
      </Section>

      {/* Open Questions */}
      <Section title="Open Questions">
        {result.open_questions.length ? (
          <ul className="space-y-2">
            {result.open_questions.map((q, i) => (
              <li key={i} className="flex gap-2 text-gray-700 text-sm">
                <span className="text-yellow-500 mt-0.5">?</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">None recorded</p>
        )}
      </Section>

      {/* Action Items */}
      <Section title="Action Items">
        {result.action_items.length === 0 ? (
          <p className="text-gray-400 text-sm">No action items found</p>
        ) : (
          <>
            <div className="space-y-3">
              {visibleActions.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" className="mt-1 accent-indigo-600" readOnly />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-medium">{item.task}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      {item.assignee && <span>👤 {item.assignee}</span>}
                      {item.deadline && <span>📅 {item.deadline}</span>}
                      {item.evidence && (
                        <span className="italic text-gray-400">"{item.evidence}"</span>
                      )}
                    </div>
                  </div>
                  <Badge level={item.confidence} />
                </div>
              ))}
            </div>
            {result.action_items.some((a) => a.confidence === "low") && (
              <button
                onClick={() => setShowLowConf(!showLowConf)}
                className="mt-3 text-xs text-gray-400 underline"
              >
                {showLowConf ? "Hide" : "Show"} low-confidence items
              </button>
            )}
          </>
        )}
      </Section>

      {/* Transcript */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 p-6 shadow-sm">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Full Transcript
          </h3>
          <span className="text-gray-400 text-sm">{showTranscript ? "▲ Hide" : "▼ Show"}</span>
        </button>
        {showTranscript && (
          <p className="mt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {result.transcript}
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <a href="/" className="text-indigo-600 text-sm hover:underline">
          ← Process another meeting
        </a>
      </div>
    </div>
  );
}