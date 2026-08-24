import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Search } from "lucide-react";
import client from "../api/client";

const CATEGORY_DOT = {
  infiltration_attempt: "#f87171", ied: "#dc2626", protest: "#fbbf24",
  troop_movement: "#a78bfa", propaganda_broadcast: "#60a5fa",
  ceasefire_violation: "#fb7185", supply_convoy: "#34d399",
  aerial_activity: "#22d3ee", null: "#b4b8c7",
};

function MetricCard({ label, value, sub, progress, gradient }) {
  return (
    <div className="ld-metric-card" style={{ background: gradient }}>
      <div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{label}</div>
        <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>{value}</div>
      </div>
      <div>
        <div className="ld-progress-track">
          <div className="ld-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [entities, setEntities] = useState([]);
  const [reviewQueue, setReviewQueue] = useState({ pending_entity_links: [], pending_classifications: [] });
  const [detections, setDetections] = useState([]);
  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/entities/").then((r) => setEntities(r.data));
    client.get("/review/queue").then((r) => setReviewQueue(r.data));
    client.get("/detections/").then((r) => setDetections(r.data));
    client.get("/map/events").then((r) => setEvents(r.data));
    client.get("/incidents/", { params: { min_reliability: 4 } }).then((r) => setIncidents(r.data));
  }, []);

  const assessedCount = entities.filter((e) => e.threat_level).length;
  const assessedPct = entities.length ? Math.round((assessedCount / entities.length) * 100) : 0;

  const pendingCount = reviewQueue.pending_entity_links.length + reviewQueue.pending_classifications.length;
  const pendingPct = entities.length ? Math.min(100, Math.round((pendingCount / (entities.length + 1)) * 100)) : 0;

  const newDetections = detections.filter((d) => d.status === "new");
  const reviewedPct = detections.length ? Math.round(((detections.length - newDetections.length) / detections.length) * 100) : 0;

  const chartData = (() => {
    const days = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    events.forEach((e) => {
      const key = e.published_at?.slice(0, 10);
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date: date.slice(5), count }));
  })();

  const weekTotal = chartData.slice(-7).reduce((sum, d) => sum + d.count, 0);
  const username = localStorage.getItem("argus_username") || "Analyst";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="ld-main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <div style={{ fontSize: 13, color: "var(--ld-text-secondary)", marginTop: 4 }}>{today}</div>
        </div>
        <div className="ld-search">
          <Search size={15} />
          <input
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/entities?q=${search}`)}
          />
        </div>
      </div>

      <div className="ld-metrics-grid">
        <MetricCard
          label="Entities Tracked" value={entities.length}
          sub={`${assessedPct}% threat-assessed`} progress={assessedPct}
          gradient="linear-gradient(135deg, var(--ld-violet), var(--ld-violet-2))"
        />
        <MetricCard
          label="Pending Review" value={pendingCount}
          sub="awaiting analyst action" progress={pendingPct}
          gradient="linear-gradient(135deg, var(--ld-magenta), var(--ld-magenta-2))"
        />
        <MetricCard
          label="Active Detections" value={newDetections.length}
          sub={`${reviewedPct}% of all-time reviewed`} progress={reviewedPct}
          gradient="linear-gradient(135deg, var(--ld-green), var(--ld-green-2))"
        />
      </div>

      
      <div className="ld-content-grid">
        <div className="ld-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Ingestion Activity</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{weekTotal} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--ld-text-tertiary)" }}>this week</span></div>
          </div>
          <div style={{ height: 180, marginTop: 12 }}>
            {events.length === 0 ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ld-text-tertiary)", fontSize: 13 }}>
                No geocoded events yet — ingestion or NLP processing hasn't populated this view.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillViolet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6d5df7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6d5df7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#b4b8c7" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #edeef4", fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#6d5df7" strokeWidth={2} fill="url(#fillViolet)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="ld-card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Recent Detections</div>
            {detections.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--ld-text-tertiary)", padding: "8px 0" }}>None yet — the detection engines run every 6 hours.</div>
            ) : (
              detections.slice(0, 5).map((d) => (
                <div key={d.id} className="ld-list-row">
                  <span className="ld-dot" style={{ background: "#6d5df7" }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</div>
                    <div style={{ fontSize: 11, color: "var(--ld-text-tertiary)" }}>{d.type} · {Math.round(d.confidence * 100)}% confidence</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="ld-card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>High-Reliability Incidents</div>
            {incidents.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--ld-text-tertiary)", padding: "8px 0" }}>No incidents rated 4+ yet.</div>
            ) : (
              incidents.slice(0, 5).map((i) => (
                <div key={i.id} className="ld-list-row">
                  <span className="ld-dot" style={{ background: CATEGORY_DOT[i.type] || "#b4b8c7" }} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.location}</div>
                    <div style={{ fontSize: 11, color: "var(--ld-text-tertiary)" }}>{i.type} · rated {i.reliability_rating}/5</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}