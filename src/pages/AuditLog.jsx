import { useEffect, useState } from "react";
import client from "../api/client";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [pathFilter, setPathFilter] = useState("");

  useEffect(() => {
    client.get("/audit/logs", { params: { path_contains: pathFilter || undefined } }).then((res) => setLogs(res.data));
  }, [pathFilter]);

  return (
    <div className="ld-main">
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Activity Log</h1>
      <input placeholder="Filter by path..." value={pathFilter} onChange={(e) => setPathFilter(e.target.value)} style={{ width: 280, marginBottom: 16 }} />
      <div className="ld-card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th style={{ padding: "10px 16px" }}>Time</th><th>Analyst</th><th>Method</th><th>Path</th><th>Status</th><th>ms</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td data-label="Time" style={{ padding: "10px 16px", fontSize: 12 }}>{l.created_at?.slice(0, 19).replace("T", " ")}</td>
                <td data-label="Analyst" style={{ fontSize: 12 }}>{l.analyst}</td>
                <td data-label="Method" style={{ fontSize: 12 }}>{l.method}</td>
                <td data-label="Path" style={{ fontSize: 12 }}>{l.path}</td>
                <td data-label="Status" style={{ fontSize: 12, color: l.status_code >= 400 ? "var(--fill-danger, #d9534f)" : "inherit" }}>{l.status_code}</td>
                <td data-label="ms" style={{ fontSize: 12 }}>{l.duration_ms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}