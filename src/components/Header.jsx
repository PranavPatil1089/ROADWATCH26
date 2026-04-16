import { useNavigate, Link } from "react-router-dom";
import { ShieldAlert, LogOut } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const role = localStorage.getItem("roadguard_user");

  const handleLogout = () => {
    localStorage.removeItem("roadguard_user");
    navigate("/");
  };

  return (
    <header className="gov-header">
      <Link to="/" style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "0.5rem", borderRadius: "8px" }}>
          <ShieldAlert size={28} color="#3B82F6" />
        </div>
        <div>
          <h2>RoadGuard AI</h2>
          <small>Nashik Intelligent Road Safety</small>
        </div>
      </Link>
      <div>
        {role && (
          <button className="btn btn-outline btn-header" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LogOut size={16} /> Logout
          </button>
        )}
      </div>
    </header>
  );
}
