import { useEffect, useState } from "react";
import client from "../api/client";

const TYPES = ["border_clash", "ceasefire_violation", "troop_movement", "civilian_incident", "influence_operation", "other"];

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({ incident_date: "", location: "", type: "border_clash", description: "", reliability_rating: 3 });

  const load = () => {
    client.get("/incidents/").then((res) => setIncidents(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await client.post("/incidents/", { ...form, incident_date: new Date(form.incident_date).toISOString() });
    setForm({ incident_date: "", location: "", type: "border_clash", description: "", reliability_rating: 3 });
    load();
  };

  return (
    <div className="ld-main" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Incident reports</h1>

      <div className="ld-card" style={{ marginBottom: 16 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input type="datetime-local" required value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} />
          <input placeholder="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea placeholder="Description" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label style={{ fontSize: 13, color: "var(--ld-text-secondary)" }}>
            Reliability (1–5)
            <input type="number" min={1} max={5} value={form.reliability_rating} onChange={(e) => setForm({ ...form, reliability_rating: parseInt(e.target.value) })} style={{ marginLeft: 8, width: 60 }} />
          </label>
          <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>Log incident</button>
        </form>
      </div>

      <div className="ld-card">
        {incidents.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>No incidents logged yet.</div>
        ) : incidents.map((i) => (
          <div key={i.id} className="ld-list-row">
            <span style={{ color: "var(--ld-text-tertiary)", minWidth: 90 }}>{i.incident_date?.slice(0, 10)}</span>
            <span>{i.location} — {i.type}</span>
            <span style={{ marginLeft: "auto", color: "var(--ld-text-tertiary)" }}>{i.reliability_rating}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
}