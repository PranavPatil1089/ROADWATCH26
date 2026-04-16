import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import { LayoutDashboard, Map as MapIcon, BarChart3, Lightbulb, Settings2 } from "lucide-react";
import { getProcessedNashikData } from "../../utils/dataProcessor";
import { getWeather } from "../../services/weather";

export default function AdminLayout() {
  const location = useLocation();
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
       const w = await getWeather(19.9975, 73.7898);
       if (!active) return;
       const hr = new Date().getHours();
       setNodes(getProcessedNashikData(w, hr));
    }
    load();
    return () => { active = false; };
  }, []);

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="admin-layout animate-fade-in">
        <aside className="sidebar">
          <Link to="/admin" className={`sidebar-link ${isActive("/admin")}`}>
            <LayoutDashboard size={20} /> Dashboard Overview
          </Link>
          <Link to="/admin/map" className={`sidebar-link ${isActive("/admin/map")}`}>
            <MapIcon size={20} /> Infrastructure Map
          </Link>
          <Link to="/admin/analytics" className={`sidebar-link ${isActive("/admin/analytics")}`}>
            <BarChart3 size={20} /> Risk Analytics Database
          </Link>
          <Link to="/admin/suggestions" className={`sidebar-link ${isActive("/admin/suggestions")}`}>
            <Lightbulb size={20} /> Actionable Suggestions
          </Link>
          <Link to="/admin/digital-twin" className={`sidebar-link ${isActive("/admin/digital-twin")}`}>
            <Settings2 size={20} /> Digital Twin Engine
          </Link>
        </aside>
        <main className="admin-main">
          <Outlet context={{ nodes }} />
        </main>
      </div>
    </div>
  );
}
