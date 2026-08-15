import { useEffect, useState } from "react";
import client from "../api/client";

export default function Detections() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/detections/").then((res) => setDetections(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="ld-main">
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Detections</h1>
      <div className="ld-card">
        {loading ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>Loading...</div>
        ) : detections.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>
            No detections yet — the detection engines run every 6 hours.
          </div>
        ) : (
          detections.map((d) => (
            <div key={d.id} className="ld-list-row">
              <span>{d.title}</span>
              <span style={{ marginLeft: "auto", color: "var(--ld-text-tertiary)" }}>
                {d.type} · {Math.round(d.confidence * 100)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}