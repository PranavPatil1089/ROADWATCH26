import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getProcessedNashikData } from "../../utils/dataProcessor";
import { getWeather } from "../../services/weather";
import { getRisk, getReason } from "../../utils/risk";
import { Clock, Activity, Settings2 } from "lucide-react";

export default function DigitalTwin() {
  const [timeHour, setTimeHour] = useState(new Date().getHours());
  const [nodes, setNodes] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    let active = true;
    async function load() {
       const w = await getWeather(19.9975, 73.7898); // Nashik Center Coordinates
       if (!active) return;
       setNodes(getProcessedNashikData(w, timeHour));
       setLastRefreshed(new Date());
    }
    load();
    
    // Auto-refresh live data simulation
    const interval = setInterval(() => { load(); }, 45000); 
    return () => { active = false; clearInterval(interval); };
  }, [timeHour]);

  const handleSliderChange = (e) => {
      setTimeHour(parseInt(e.target.value));
  };

  const formatTime = (hr) => {
      const ampm = hr >= 12 ? 'PM' : 'AM';
      let hour12 = hr % 12;
      if (hour12 === 0) hour12 = 12;
      return `${hour12}:00 ${ampm}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <Settings2 size={32} color="var(--accent-blue)" />
        <h2 style={{ fontSize: "2.2rem", color: "var(--primary-navy)", margin: 0 }}>Smart City Digital Twin Dashboard</h2>
      </div>
      <p style={{ marginBottom: "1.5rem", color: "var(--text-light)", fontSize: "1.1rem" }}>
        Interactive temporal spatial forecast models predicting traffic stress vectors based on aggregated algorithmic behavior.
        <br/><span style={{ fontSize: "0.9rem", color: "var(--success)", display: "inline-block", marginTop: "0.5rem" }}>
          Live Stream Active - Last synchronized at {lastRefreshed.toLocaleTimeString()}
        </span>
      </p>

      {/* Control Panel */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1.5rem" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
               <Clock color="var(--primary-navy)" />
               <strong style={{ fontSize: "1.2rem", minWidth: "100px" }}>{formatTime(timeHour)}</strong>
            </div>
            <input 
               type="range" 
               min="0" max="23" 
               value={timeHour} 
               onChange={handleSliderChange} 
               style={{ flex: 1, cursor: "pointer", height: "8px", borderRadius: "4px" }}
            />
         </div>
         <p style={{ margin: "1rem 0 0 0", fontSize: "0.95rem", color: "var(--text-light)" }}>
            Drag handle to simulate time-of-day changes across the infrastructure (Peak hours automatically increase nodal traffic weights dynamically).
         </p>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
        {/* Top stats bar */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "1rem", background: "rgba(15, 23, 42, 0.05)", borderBottom: "1px solid var(--border-color)" }}>
           <div><strong>Total Locations:</strong> {nodes.length}</div>
           <div><strong style={{color:"var(--danger)"}}>High Risk:</strong> {nodes.filter(n=>n.riskScore>=6).length}</div>
           <div><strong>Avg Risk Level:</strong> {nodes.length > 0 ? Math.round(nodes.reduce((a,c)=>a+(c.predictRiskScore||0),0)/nodes.length*100) : 0}%</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem", gap: "1.5rem", fontSize: "0.9rem" }}>
           <strong>Legend:</strong>
           <span style={{color:"#EF4444"}}>● High Risk</span>
           <span style={{color:"#F59E0B"}}>● Medium</span>
           <span style={{color:"#10B981"}}>● Low</span>
        </div>
        <div style={{ zIndex: 10, position: "relative", width: "100%" }}>
          <MapContainer
            center={[19.9975, 73.7898]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "850px", width: "100%", borderRadius: "0 0 12px 12px" }}
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {nodes.map((d) => {
              const risk = getRisk(d);
              const color = risk === "HIGH" ? "#EF4444" : risk === "MEDIUM" ? "#F59E0B" : "#10B981";
              const radius = risk === "HIGH" ? 24 : risk === "MEDIUM" ? 16 : 8;

              return (
                <CircleMarker 
                  key={d.id} 
                  center={[Number(d.lat), Number(d.lng)]}
                  pathOptions={{ color: color, fillColor: color, fillOpacity: d.predictRiskScore || 0.4 }}
                  radius={radius}
                  className={risk === "HIGH" ? "high-risk-svg" : ""}
                >
                  <Tooltip>
                    <div style={{ minWidth: "180px", padding: "0.25rem 0" }}>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--primary-navy)", fontSize: "1.1rem" }}>{d.name}</h3>
                      <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}><strong>Trigger Reason:</strong> <br/> {getReason(d)}</p>
                      
                      <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "0.5rem", borderRadius: "6px", margin: "0.5rem 0 0 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                           <Activity size={16} color="var(--accent-blue)" />
                           <p style={{ margin: "0", fontSize: "0.95rem", color: "var(--accent-blue)", fontWeight: "700" }}>
                              ML Risk Prob: {Math.round((d.predictRiskScore || 0) * 100)}%
                           </p>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
