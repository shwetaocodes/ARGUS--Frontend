import { useEffect, useState } from "react";
import client from "../api/client";

export default function Sitreps() {
  const [sitreps, setSitreps] = useState([]);
  const [content, setContent] = useState("");

  const load = () => client.get("/sitreps/").then((res) => setSitreps(res.data));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await client.post("/sitreps/", { content, event_id: null });
    setContent("");
    load();
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 700 }}>
      <h2>Sitreps</h2>
      <form onSubmit={submit} style={{ marginBottom: "1rem" }}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} style={{ width: "100%" }} placeholder="Log a sitrep..." />
        <button type="submit">Submit</button>
      </form>
      <ul>
        {sitreps.map((s) => (
          <li key={s.id}>{s.created_at?.slice(0, 16).replace("T", " ")} — {s.content}</li>
        ))}
      </ul>
    </div>
  );
}