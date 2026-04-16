import { useState, useEffect } from "react";
import { getProcessedNashikData } from "../../utils/dataProcessor";
import { getWeather } from "../../services/weather";
import { getRisk, getReason, getSuggestion } from "../../utils/risk";
import { Lightbulb, Wrench, AlertCircle, ShieldCheck } from "lucide-react";

export default function Suggestions() {
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

  const needsAttention = processedNodes.filter((d) => getRisk(d) !== "LOW");

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <Lightbulb size={32} color="var(--warning)" />
        <h2 style={{ fontSize: "2.2rem", color: "var(--primary-navy)", margin: 0 }}>Actionable Suggestions</h2>
      </div>
      <p style={{ marginBottom: "2rem", color: "var(--text-light)", fontSize: "1.1rem" }}>Automated intelligence operations mapping high-priority infrastructure renovations.</p>
      
      <div className="card">
        {needsAttention.length > 0 ? (
          <div>
            {needsAttention.map((d) => {
              const risk = getRisk(d);
              return (
                <div key={d.id} className={`suggestion-item ${risk.toLowerCase()}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ paddingTop: "0.25rem" }}>
                         {risk === 'HIGH' ? <AlertCircle color="var(--danger)" /> : <Wrench color="var(--warning)" />}
                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "var(--text-dark)" }}>{d.name}</h3>
                        <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-light)" }}><strong>Vulnerability trigger:</strong> {getReason(d)}</p>
                        <div style={{ display: "inline-block", background: "#EFF6FF", padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                          <p style={{ margin: 0, fontWeight: "600", color: "var(--accent-blue)" }}>Remediation Strategy: {getSuggestion(d)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`status-pill ${risk === 'HIGH' ? 'status-high' : 'status-medium'}`}>
                        {risk} PRIORITY
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--success)" }}>
            <div style={{ display: "inline-block", background: "var(--success-light)", padding: "1rem", borderRadius: "50%", marginBottom: "1rem" }}>
               <ShieldCheck size={48} />
            </div>
            <h3>System Secure</h3>
            <p style={{ color: "var(--text-light)" }}>No immediate infrastructure improvements suggested. All nodes are functioning optimally.</p>
          </div>
        )}
      </div>
    </div>
  );
}
