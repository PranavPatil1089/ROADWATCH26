import { useState, useEffect } from "react";
import { getProcessedNashikData } from "../../utils/dataProcessor";
import { getWeather } from "../../services/weather";
import { getRisk } from "../../utils/risk";
import { Activity, AlertOctagon, AlertTriangle } from "lucide-react";

export default function AdminOverview() {
  const [processedNodes, setProcessedNodes] = useState([]);

  useEffect(() => {
    async function loadData() {
      const weather = await getWeather(19.9975, 73.7898);
      const hour = new Date().getHours();
      const nodes = getProcessedNashikData(weather, hour);
      setProcessedNodes(nodes);
    }
    loadData();
  }, []);

  const totalLocations = processedNodes.length;
  const highRisk = processedNodes.filter((d) => getRisk(d) === "HIGH").length;
  const medRisk = processedNodes.filter((d) => getRisk(d) === "MEDIUM").length;

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: "2.2rem", color: "var(--primary-navy)" }}>Command Center Overview</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "2.5rem", fontSize: "1.1rem" }}>Central authority portal for intelligent road safety management.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
        <div className="card" style={{ borderTop: "4px solid var(--accent-blue)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-dark)", margin: 0 }}>Total Monitored Nodes</h3>
            <div style={{ padding: "0.5rem", background: "rgba(59,130,246,0.1)", borderRadius: "8px", color: "var(--accent-blue)" }}>
              <Activity size={24} />
            </div>
          </div>
          <p style={{ fontSize: "3rem", fontWeight: "700", margin: 0, color: "var(--primary-navy)", lineHeight: "1" }}>{totalLocations}</p>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--danger)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-dark)", margin: 0 }}>High Risk Zones</h3>
            <div style={{ padding: "0.5rem", background: "var(--danger-light)", borderRadius: "8px", color: "var(--danger)" }}>
              <AlertOctagon size={24} />
            </div>
          </div>
          <p style={{ fontSize: "3rem", fontWeight: "700", margin: 0, color: "var(--danger)", lineHeight: "1" }}>{highRisk}</p>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--warning)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-dark)", margin: 0 }}>Medium Risk Zones</h3>
            <div style={{ padding: "0.5rem", background: "var(--warning-light)", borderRadius: "8px", color: "var(--warning)" }}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <p style={{ fontSize: "3rem", fontWeight: "700", margin: 0, color: "var(--warning)", lineHeight: "1" }}>{medRisk}</p>
        </div>
      </div>
    </div>
  );
}
