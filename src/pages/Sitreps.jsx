import { useEffect, useState } from "react";
import client from "../api/client";

export default function Sitreps() {
  const [sitreps, setSitreps] = useState([]);
  const [content, setContent] = useState("");

  const load = () => client.get("/sitreps/").then((res) => setSitreps(res.data));
  useEffect(() => {
  load();
}, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await client.post("/sitreps/", { content, event_id: null });
    setContent("");
    load();
  };

  return (
    <div className="ld-main" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Sitreps</h1>

      <div className="ld-card" style={{ marginBottom: 16 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Log a sitrep..." style={{ width: "100%", maxWidth: 700 }} />
          <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>Submit</button>
        </form>
      </div>

      <div className="ld-card">
        {sitreps.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>No sitreps logged yet.</div>
        ) : sitreps.map((s) => (
          <div key={s.id} className="ld-list-row">
            <span style={{ color: "var(--ld-text-tertiary)", minWidth: 130 }}>{s.created_at?.slice(0, 16).replace("T", " ")}</span>
            <span>{s.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}