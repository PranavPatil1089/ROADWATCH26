import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getProcessedNashikData } from "../../utils/dataProcessor";
import { getWeather } from "../../services/weather";
import { getRisk, getReason, getSuggestion } from "../../utils/risk";
import { Map, Zap, CloudRain, Car } from "lucide-react";

export default function AdminMap() {
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
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <Map size={32} color="var(--accent-blue)" />
        <h2 style={{ fontSize: "2.2rem", color: "var(--primary-navy)", margin: 0 }}>Infrastructure & Risk Map</h2>
      </div>
      <p style={{ marginBottom: "2rem", color: "var(--text-light)", fontSize: "1.1rem" }}>Spatial overview of all city nodes and their calculated real-time risks.</p>
      
      <div className="card" style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", minHeight: "600px", zIndex: 10 }}>
          <MapContainer
            center={[19.9975, 73.7898]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {processedNodes.map((d) => {
              const risk = getRisk(d);
              return (
                <Marker key={d.id} position={[d.lat, d.lng]}>
                  <Popup>
                    <div style={{ minWidth: "220px", padding: "0.5rem 0" }}>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--primary-navy)", fontSize: "1.1rem", borderBottom: "2px solid #E2E8F0", paddingBottom: "0.5rem" }}>{d.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <strong style={{ fontSize: "0.9rem" }}>Risk Level:</strong> 
                        <span className={`status-pill ${risk === 'HIGH' ? 'status-high' : risk === 'MEDIUM' ? 'status-medium' : 'status-low'}`}>
                          {risk}
                        </span>
                      </div>
                      <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}><strong>Trigger Reason:</strong> {getReason(d)}</p>
                      <div style={{ background: "#F8FAFC", padding: "0.5rem", borderRadius: "6px", border: "1px solid #E2E8F0", margin: "0.5rem 0" }}>
                        <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--accent-blue)", fontWeight: "600" }}>Suggestion:</p>
                        <p style={{ margin: "0", fontSize: "0.9rem" }}>{getSuggestion(d)}</p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-light)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Car size={14}/> {d.traffic}/2</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><CloudRain size={14}/> {d.weather}/2</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Zap size={14}/> {d.signal ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
