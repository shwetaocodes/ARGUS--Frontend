import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function EntityList() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get("/entities/", { params: { q: search || undefined } })
      .then((res) => setEntities(res.data))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="ld-main">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Entities</h1>
        <div style={{ fontSize: 13, color: "var(--ld-text-secondary)", marginTop: 4 }}>
          {entities.length} tracked
        </div>
      </div>

      <input
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 320, marginBottom: 20 }}
      />

      <div className="ld-card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th style={{ padding: "12px 16px" }}>Name</th><th>Type</th><th>Threat</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: 16, color: "var(--ld-text-tertiary)" }}>Loading...</td></tr>
            ) : entities.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 16, color: "var(--ld-text-tertiary)" }}>
                No entities yet — they appear once ingested content has been processed by NLP extraction.
              </td></tr>
            ) : (
              entities.map((e) => (
                <tr key={e.id}>
                  <td style={{ padding: "12px 16px" }}><Link to={`/entities/${e.id}`}>{e.name}</Link></td>
                  <td>{e.type}</td>
                  <td>{e.threat_level || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}