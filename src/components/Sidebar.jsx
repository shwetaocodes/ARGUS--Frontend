import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Map, FileText, AlertTriangle, Activity, ScrollText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ClipboardCheck } from "lucide-react";

const LINKS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/entities", icon: Users, label: "Entities" },
  { to: "/map", icon: Map, label: "Maps" },
  { to: "/sitreps", icon: FileText, label: "Sitreps" },
  { to: "/incidents", icon: AlertTriangle, label: "Incidents" },
  { to: "/detections", icon: Activity, label: "Detections" },
  { to: "/review", icon: ClipboardCheck, label: "Review" },
  { to: "/audit", icon: ScrollText, label: "Audit" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
    <div className="ld-sidebar ld-sidebar-desktop">
      <div className="ld-logo">A</div>
      {LINKS.map(({ to, icon: Icon }) => (
        <Link key={to} to={to} className={`ld-nav-icon ${location.pathname.startsWith(to) ? "active" : ""}`}>
          <Icon size={19} strokeWidth={2} />
        </Link>
      ))}
      <div style={{ marginTop: "auto" }}>
        <div className="ld-nav-icon" onClick={logout} title="Logout">
          <LogOut size={19} strokeWidth={2} />
        </div>
      </div>
    </div>

    <nav className="ld-bottom-nav">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`ld-bottom-nav-item ${location.pathname.startsWith(to) ? "active" : ""}`}>
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}