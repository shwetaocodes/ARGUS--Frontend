import { useState } from "react";
import client from "../api/client";

export default function HistoricalImport() {
  const [eventsResult, setEventsResult] = useState(null);
  const [incidentsResult, setIncidentsResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async (endpoint, file, setResult) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await client.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.detail || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ld-main" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Historical Import</h1>

      <div className="ld-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 8 }}>Historical events (CSV or Excel)</div>
        <div style={{ fontSize: 12, color: "var(--ld-text-tertiary)", marginBottom: 10 }}>
          Columns required: title, summary, raw_text, published_at, source_name
        </div>
        <input type="file" accept=".csv,.xlsx,.xls" disabled={loading}
          onChange={(e) => e.target.files[0] && upload("/historical-import/events", e.target.files[0], setEventsResult)} />
        {eventsResult && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            {eventsResult.error
              ? <span style={{ color: "var(--fill-danger, #d9534f)" }}>{eventsResult.error}</span>
              : <>Inserted {eventsResult.inserted}, skipped {eventsResult.skipped_duplicates} duplicates</>}
          </div>
        )}
      </div>

      <div className="ld-card">
        <div style={{ fontWeight: 500, marginBottom: 8 }}>Historical incidents (CSV or Excel)</div>
        <div style={{ fontSize: 12, color: "var(--ld-text-tertiary)", marginBottom: 10 }}>
          Columns required: incident_date, location, type, description, reliability_rating
        </div>
        <input type="file" accept=".csv,.xlsx,.xls" disabled={loading}
          onChange={(e) => e.target.files[0] && upload("/historical-import/incidents", e.target.files[0], setIncidentsResult)} />
        {incidentsResult && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            {incidentsResult.error
              ? <span style={{ color: "var(--fill-danger, #d9534f)" }}>{incidentsResult.error}</span>
              : (
                <>
                  Inserted {incidentsResult.inserted}
                  {incidentsResult.skipped_invalid_rows?.length > 0 && (
                    <span> — {incidentsResult.skipped_invalid_rows.length} rows skipped (invalid data)</span>
                  )}
                </>
              )}
          </div>
        )}
      </div>
    </div>
  );
}