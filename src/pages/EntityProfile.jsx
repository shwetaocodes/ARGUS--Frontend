import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";

export default function EntityProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [note, setNote] = useState("");

  const load = () => {
    client.get(`/entities/${id}/profile`).then((res) => setProfile(res.data));
    client.get(`/entities/${id}/timeline`).then((res) => setTimeline(res.data));
    client.get(`/entities/${id}/relationships`).then((res) => setRelationships(res.data));
    client.get(`/entities/${id}/annotations`).then((res) => setAnnotations(res.data));
  };

  useEffect(load, [id]);

  const addAnnotation = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await client.post(`/entities/${id}/annotations`, { note });
    setNote("");
    load();
  };

  if (!profile) return <div className="ld-main" style={{ color: "var(--ld-text-tertiary)" }}>Loading...</div>;

  return (
    <div className="ld-main" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{profile.name}</h1>
      <div style={{ fontSize: 13, color: "var(--ld-text-secondary)", marginBottom: 24 }}>
        {profile.type} · first seen {profile.first_seen?.slice(0, 10) || "—"} · last seen {profile.last_seen?.slice(0, 10) || "—"} · {profile.event_count} events · threat: {profile.threat_level || "unassessed"}
      </div>

      <div className="ld-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 10 }}>Timeline</div>
        {timeline.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>No events yet.</div>
        ) : timeline.map((t) => (
          <div key={t.event_id} className="ld-list-row">
            <span style={{ color: "var(--ld-text-tertiary)", minWidth: 90 }}>{t.published_at?.slice(0, 10) || "—"}</span>
            <span>{t.title}</span>
          </div>
        ))}
      </div>

      <div className="ld-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 10 }}>Related entities</div>
        {relationships.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>No known relationships yet.</div>
        ) : relationships.map((r) => (
          <div key={r.entity_id} className="ld-list-row">
            <span>{r.name} ({r.type})</span>
            <span style={{ marginLeft: "auto", color: "var(--ld-text-tertiary)" }}>co-occurred {r.co_occurrence_count}×</span>
          </div>
        ))}
      </div>

      <div className="ld-card">
        <div style={{ fontWeight: 500, marginBottom: 10 }}>Annotations</div>
        <form onSubmit={addAnnotation} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." style={{ flex: 1 }} />
          <button type="submit" className="btn-primary">Add</button>
        </form>
        {annotations.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>No annotations yet.</div>
        ) : annotations.map((a) => (
          <div key={a.id} className="ld-list-row">{a.note} {a.tag && <span style={{ color: "var(--ld-text-tertiary)" }}>[{a.tag}]</span>}</div>
        ))}
      </div>
    </div>
  );
}