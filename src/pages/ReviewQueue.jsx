import { useEffect, useState } from "react";
import client from "../api/client";

const KIND_LABELS = { event: "Ingested event", incident: "Incident", sitrep: "Sitrep" };
const KIND_COLORS = { event: "var(--ld-violet)", incident: "var(--ld-magenta)", sitrep: "var(--ld-green)" };

export default function ReviewQueue() {
  const [queue, setQueue] = useState({ pending_entity_links: [], pending_classifications: [] });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [correctingLink, setCorrectingLink] = useState(null);
  const [correctedType, setCorrectedType] = useState("");
  const [correctedCategory, setCorrectedCategory] = useState("");

  const load = () => {
    setLoading(true);
    client.get("/review/queue").then((res) => setQueue(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const reviewLink = async (link, action, corrected_entity_type = null) => {
    setBusyId(`link-${link.kind}-${link.id}`);
    try {
      await client.post(`/review/entity-link/${link.id}`, {
        kind: link.kind,
        action,
        corrected_entity_type,
      });
      setCorrectingLink(null);
      setCorrectedType("");
      load();
    } finally {
      setBusyId(null);
    }
  };

  const reviewClassification = async (classificationId, action, corrected_category = null) => {
    setBusyId(`class-${classificationId}`);
    try {
      await client.post(`/review/classification/${classificationId}`, { action, corrected_category });
      setCorrectedCategory("");
      load();
    } finally {
      setBusyId(null);
    }
  };

  const totalPending = queue.pending_entity_links.length + queue.pending_classifications.length;

  return (
    <div className="ld-main" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Review Queue</h1>
        <div style={{ fontSize: 13, color: "var(--ld-text-secondary)", marginTop: 4 }}>
          {loading ? "Loading..." : `${totalPending} item${totalPending !== 1 ? "s" : ""} pending review`}
        </div>
      </div>

      {/* --- Entity link extractions --- */}
      <div className="ld-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 500, marginBottom: 12 }}>Entity extractions</div>
        {queue.pending_entity_links.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>Nothing pending.</div>
        ) : (
          queue.pending_entity_links.map((link) => (
            <div key={`${link.kind}-${link.id}`} style={{ borderBottom: "1px solid var(--ld-border)", padding: "12px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="ld-dot" style={{ background: KIND_COLORS[link.kind] }} />
                <span style={{ fontSize: 11, color: "var(--ld-text-tertiary)", minWidth: 90 }}>
                  {KIND_LABELS[link.kind]}
                </span>
                <span style={{ fontWeight: 500 }}>{link.entity_name}</span>
                <span style={{ fontSize: 12, color: "var(--ld-text-tertiary)" }}>
                  ({link.entity_type}, confidence: {link.confidence || "unrated"})
                </span>
              </div>

              {correctingLink?.kind === link.kind && correctingLink?.id === link.id ? (
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                  <select value={correctedType} onChange={(e) => setCorrectedType(e.target.value)}>
                    <option value="">Select correct type...</option>
                    <option value="person">person</option>
                    <option value="org">org</option>
                    <option value="location">location</option>
                    <option value="military_unit">military_unit</option>
                    <option value="weapon">weapon</option>
                    <option value="topic">topic</option>
                  </select>
                  <button
                    className="btn-primary"
                    disabled={!correctedType || busyId === `link-${link.kind}-${link.id}`}
                    onClick={() => reviewLink(link, "correct", correctedType)}
                  >
                    Save correction
                  </button>
                  <button onClick={() => { setCorrectingLink(null); setCorrectedType(""); }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    className="btn-primary"
                    disabled={busyId === `link-${link.kind}-${link.id}`}
                    onClick={() => reviewLink(link, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    disabled={busyId === `link-${link.kind}-${link.id}`}
                    onClick={() => setCorrectingLink({ kind: link.kind, id: link.id })}
                  >
                    Correct
                  </button>
                  <button
                    disabled={busyId === `link-${link.kind}-${link.id}`}
                    onClick={() => reviewLink(link, "reject")}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- Event classifications --- */}
      <div className="ld-card">
        <div style={{ fontWeight: 500, marginBottom: 12 }}>Event classifications</div>
        {queue.pending_classifications.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ld-text-tertiary)" }}>Nothing pending.</div>
        ) : (
          queue.pending_classifications.map((c) => (
            <div key={c.id} style={{ borderBottom: "1px solid var(--ld-border)", padding: "12px 0" }}>
              <div>
                <span style={{ fontWeight: 500 }}>{c.category}</span>
                <span style={{ fontSize: 12, color: "var(--ld-text-tertiary)", marginLeft: 8 }}>
                  event #{c.event_id} · confidence: {c.confidence}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                <button className="btn-primary" disabled={busyId === `class-${c.id}`} onClick={() => reviewClassification(c.id, "accept")}>
                  Accept
                </button>
                <select value={correctedCategory} onChange={(e) => setCorrectedCategory(e.target.value)} style={{ fontSize: 12 }}>
                  <option value="">Correct to...</option>
                  <option value="infiltration_attempt">infiltration_attempt</option>
                  <option value="ied">ied</option>
                  <option value="protest">protest</option>
                  <option value="troop_movement">troop_movement</option>
                  <option value="propaganda_broadcast">propaganda_broadcast</option>
                  <option value="ceasefire_violation">ceasefire_violation</option>
                  <option value="supply_convoy">supply_convoy</option>
                  <option value="aerial_activity">aerial_activity</option>
                  <option value="other">other</option>
                </select>
                <button
                  disabled={!correctedCategory || busyId === `class-${c.id}`}
                  onClick={() => reviewClassification(c.id, "correct", correctedCategory)}
                >
                  Apply
                </button>
                <button disabled={busyId === `class-${c.id}`} onClick={() => reviewClassification(c.id, "reject")}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}