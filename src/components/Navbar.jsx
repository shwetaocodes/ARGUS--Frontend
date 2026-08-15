import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link to="/entities">Entities</Link>
      <Link to="/map">Map</Link>
      <Link to="/sitreps">Sitreps</Link>
      <Link to="/incidents">Incidents</Link>
      <button onClick={logout} style={{ marginLeft: "auto" }}>Logout</button>
    </nav>
  );
}