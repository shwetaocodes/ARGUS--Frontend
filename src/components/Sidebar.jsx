import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Map, FileText, AlertTriangle, Activity, ScrollText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ClipboardCheck } from "lucide-react";

const LINKS = [
  { to: "/dashboard", icon: LayoutDashboard },
  { to: "/entities", icon: Users },
  { to: "/map", icon: Map },
  { to: "/sitreps", icon: FileText },
  { to: "/incidents", icon: AlertTriangle },
  { to: "/detections", icon: Activity },
  { to: "/review", icon: ClipboardCheck },
  { to: "/audit", icon: ScrollText },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="ld-sidebar">
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
  );
}