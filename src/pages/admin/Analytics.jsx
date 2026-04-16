import { useState, useEffect } from "react";
import { getProcessedNashikData } from "../../utils/dataProcessor";
import { getWeather } from "../../services/weather";
import { Database, TrendingUp, AlertTriangle } from "lucide-react";

export default function Analytics() {
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

  const totalAccidents = processedNodes.reduce((acc, curr) => acc + curr.accident, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <Database size={32} color="var(--accent-blue)" />
        <h2 style={{ fontSize: "2.2rem", color: "var(--primary-navy)", margin: 0 }}>Risk Analytics Database</h2>
      </div>
      <p style={{ marginBottom: "2rem", color: "var(--text-light)", fontSize: "1.1rem" }}>Central repository for historical accident metrics and atmospheric condition correlations.</p>
      
      <div className="card" style={{ marginBottom: "2rem", background: "linear-gradient(to right, #EFF6FF, white)", borderLeft: "4px solid var(--accent-blue)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "white", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
            <TrendingUp size={28} color="var(--accent-blue)" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "var(--text-light)", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Historical Accidents Recorded</h3>
            <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: "700", color: "var(--primary-navy)", lineHeight: "1.2" }}>{totalAccidents}</p>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ padding: "0" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Location Node</th>
                <th>Traffic Density</th>
                <th>Visibility/Weather</th>
                <th>Signal Active</th>
                <th>Historical Accidents</th>
              </tr>
            </thead>
            <tbody>
              {processedNodes.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: "600", color: "var(--primary-navy)" }}>{d.name}</td>
                  <td>
                    <span className={`status-pill ${d.traffic === 2 ? 'status-high' : d.traffic === 1 ? 'status-medium' : 'status-low'}`}>
                      {d.traffic === 2 ? "High (2)" : d.traffic === 1 ? "Medium (1)" : "Low (0)"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${d.weather === 2 ? 'status-high' : d.weather === 1 ? 'status-medium' : 'status-low'}`}>
                      {d.weather === 2 ? "Poor (2)" : d.weather === 1 ? "Moderate (1)" : "Clear (0)"}
                    </span>
                  </td>
                  <td>
                    {d.signal === 1 ? 
                      <span style={{ color: "var(--success)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.25rem" }}>Yes</span> : 
                      <span style={{ color: "var(--danger)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.25rem" }}><AlertTriangle size={14}/> No</span>
                    }
                  </td>
                  <td style={{ fontWeight: "700", fontSize: "1.1rem" }}>{d.accident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
