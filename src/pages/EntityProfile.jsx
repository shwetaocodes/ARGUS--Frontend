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

  if (!profile) return <p style={{ padding: "1rem" }}>Loading...</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: 800 }}>
      <h2>{profile.name}</h2>
      <p>Type: {profile.type} · First seen: {profile.first_seen?.slice(0, 10) || "—"} · Last seen: {profile.last_seen?.slice(0, 10) || "—"} · Events: {profile.event_count} · Threat: {profile.threat_level || "unassessed"}</p>

      <h3>Timeline</h3>
      <ul>
        {timeline.map((t) => (
          <li key={t.event_id}>{t.published_at?.slice(0, 10) || "no date"} — {t.title} <em>({t.status})</em></li>
        ))}
      </ul>

      <h3>Related entities</h3>
      <ul>
        {relationships.map((r) => (
          <li key={r.entity_id}>{r.name} ({r.type}) — co-occurred {r.co_occurrence_count}×</li>
        ))}
      </ul>

      <h3>Annotations</h3>
      <form onSubmit={addAnnotation} style={{ marginBottom: "1rem" }}>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." style={{ width: 400, marginRight: 8 }} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {annotations.map((a) => (
          <li key={a.id}>{a.note} {a.tag && `[${a.tag}]`}</li>
        ))}
      </ul>
    </div>
  );
}