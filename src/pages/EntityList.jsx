import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function EntityList() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    client.get("/entities/", { params: { q: search || undefined } }).then((res) => setEntities(res.data));
  }, [search]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Entities</h2>
      <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: "1rem", width: 300 }} />
      <table width="100%">
        <thead><tr><th align="left">Name</th><th align="left">Type</th><th align="left">Threat</th></tr></thead>
        <tbody>
          {entities.map((e) => (
            <tr key={e.id}>
              <td><Link to={`/entities/${e.id}`}>{e.name}</Link></td>
              <td>{e.type}</td>
              <td>{e.threat_level || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}