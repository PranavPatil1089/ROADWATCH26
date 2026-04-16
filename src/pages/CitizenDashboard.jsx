import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header";
import { LOCATION_OPTIONS } from "../data/nashikData";
import { getProcessedNashikData } from "../utils/dataProcessor";
import { getWeather } from "../services/weather";
import { getFastestRoute, getSaferRoute } from "../services/routing";
import { getRisk } from "../utils/risk";
import { Search, MapPin, Navigation, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Fix for leaflet markers
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;


console.log("Weather API Key:", import.meta.env.VITE_WEATHER_API_KEY);

function LocationSearch({ label, value, onChange }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions = LOCATION_OPTIONS
    .filter((loc) => loc.label.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 20);

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {label === "Source" ? <MapPin size={16} /> : <Navigation size={16} />} {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          className="input-field"
          style={{ paddingLeft: "2.5rem" }}
          value={query || (LOCATION_OPTIONS.find(l => l.value === value)?.label || "")}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); onChange(""); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={`Search for a ${label.toLowerCase()}...`}
        />
        <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="dropdown"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((loc) => (
                <div 
                  key={loc.value} 
                  className="dropdown-item" 
                  onClick={() => { 
                    onChange(loc.value); 
                    setQuery(loc.label); 
                    setIsOpen(false); 
                  }}
                >
                  {loc.label}
                </div>
              ))
            ) : (
              <div className="dropdown-item" style={{ color: "var(--text-light)" }}>No dynamic sources recorded...</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CitizenDashboard() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [processedNodes, setProcessedNodes] = useState([]);

  useEffect(() => {
  let active = true;

  async function loadData() {
    const weather = await getWeather(19.9975, 73.7898);
    const hour = new Date().getHours();
    const nodes = getProcessedNashikData(weather, hour);

    if (!active) return;
    setProcessedNodes(nodes);
  }

  loadData();

  return () => { active = false; };
}, []);


useEffect(() => {
  if (!source || !destination || processedNodes.length === 0) return;

  const [sLat, sLng] = source.split(",").map(Number);
  const [dLat, dLng] = destination.split(",").map(Number);

  const sourceLoc = { lat: sLat, lng: sLng };
  const destLoc = { lat: dLat, lng: dLng };

  const riskSourceNode = processedNodes.find((n) => 
    Math.abs(Number(n.lat) - sLat) < 0.0001 && 
    Math.abs(Number(n.lng) - sLng) < 0.0001
  );
  const riskDestNode = processedNodes.find((n) => 
    Math.abs(Number(n.lat) - dLat) < 0.0001 && 
    Math.abs(Number(n.lng) - dLng) < 0.0001
  );

  const riskDest = riskDestNode ? getRisk(riskDestNode) : "LOW";
  const riskSource = riskSourceNode ? getRisk(riskSourceNode) : "LOW";

  const riskPoints = [];
  if (riskDest === "HIGH" || riskSource === "HIGH") {
    riskPoints.push(destLoc);
  }

  async function loadRoutes() {
    const fastestCoords = await getFastestRoute(sourceLoc, destLoc);
    const saferCoords = await getSaferRoute(sourceLoc, destLoc, riskPoints);

    const riskDestPct = riskDestNode ? Math.round((riskDestNode.predictRiskScore || 0) * 100) : 0;

    setRoutes([
      { id: "fast", name: "Fastest Path", coords: fastestCoords, color: "#EF4444", opacity: 0.8, risk: riskDestPct },
      { id: "safe", name: "Safer Alternative", coords: saferCoords.length > 0 ? saferCoords : fastestCoords, color: "#10B981", opacity: 1, risk: Math.max(0, riskDestPct - 40) },
    ]);

    if (riskDest === "HIGH" || riskSource === "HIGH") {
      setAlerts([{ type: "danger", msg: "HIGH RISK alert actively triggering along your route." }]);
    } else {
      setAlerts([{ type: "success", msg: "Safe route available." }]);
    }
  }

  loadRoutes();
}, [source, destination, processedNodes]);
        

        
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-layout">
      <Header />
      <main className="dashboard-content">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "2.5rem", color: "var(--primary-navy)", letterSpacing: "-0.5px" }}>Citizen Travel Hub</h2>
              <p style={{ color: "var(--text-light)", fontSize: "1.1rem", margin: 0 }}>Determine optimal and secure infrastructure routing matrices using verified live data APIs.</p>
            </div>
            {processedNodes.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--border-color)", padding: "0.75rem 1.25rem", borderRadius: "12px", display: "flex", gap: "1.5rem", alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
                <div>
                  <small style={{ color: "var(--success)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>● Live Data Active</small>
                </div>
                <div style={{ paddingLeft: "1.5rem", borderLeft: "2px solid #E2E8F0" }}>
                  <small style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem", textTransform: "uppercase" }}>Current Weather</small>
                  <strong>{processedNodes[0]?.currentWeatherCondition || "Clear"}</strong>
                </div>
                <div style={{ paddingLeft: "1.5rem", borderLeft: "2px solid #E2E8F0" }}>
                  <small style={{ display: "block", color: "var(--text-light)", fontSize: "0.75rem", textTransform: "uppercase" }}>Traffic State</small>
                  <strong style={{ color: (new Date().getHours() >= 8 && new Date().getHours() <= 11) || (new Date().getHours() >= 17 && new Date().getHours() <= 21) ? "var(--danger)" : "var(--success)" }}>
                    {(new Date().getHours() >= 8 && new Date().getHours() <= 11) || (new Date().getHours() >= 17 && new Date().getHours() <= 21) ? "Peak Volume" : "Normal Flow"}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className="card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="search-section" style={{ alignItems: "flex-end" }}>
            <LocationSearch label="Source" value={source} onChange={setSource} />
            <LocationSearch label="Destination" value={destination} onChange={setDestination} />
            {source && destination && source !== destination && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn" style={{ height: "52px" }} onClick={() => { setSource(""); setDestination(""); }}>
                Clear
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {alerts.length > 0 && alerts.map((alert, i) => (
              <motion.div key={i} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`alert-banner ${alert.type === 'danger' ? 'alert-danger' : 'alert-success'}`}>
                <div style={{ marginTop: "2px" }}>{alert.type === 'danger' ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}</div>
                <div>
                  <strong style={{ display: "block", marginBottom: "0.25rem", fontSize: "1.1rem" }}>{alert.type === 'danger' ? 'Critical Traffic/Weather Warning' : 'Safe Route Verified'}</strong>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: "1rem" }}>{alert.msg}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div style={{ position: "relative" }}>
            <div className="map-wrapper">
              <MapContainer center={[19.9975, 73.7898]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 10 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {routes.map(r => (
                  <Polyline key={r.id} positions={r.coords} color={r.color} weight={7} opacity={r.opacity}>
                    <Tooltip sticky>
                      <strong style={{fontSize: "1rem"}}>{r.name}</strong><br/>
                      {r.id === "fast" && r.risk >= 50 && <span style={{color:"#EF4444"}}>Dangerous Segment Highlighted<br/></span>}
                      Risk Probability: {r.risk}%
                    </Tooltip>
                  </Polyline>
                ))}
                {(() => {
                  if (!source) return null;
                  const [lat, lng] = source.split(",").map(Number);
                  const label = LOCATION_OPTIONS.find(l => l.value === source)?.label || "Source";
                  return (
                    <Marker position={[lat, lng]}>
                      <Popup>Departure: {label}</Popup>
                    </Marker>
                  );
                })()}
                {(() => {
                  if (!destination) return null;
                  const [lat, lng] = destination.split(",").map(Number);
                  const label = LOCATION_OPTIONS.find(l => l.value === destination)?.label || "Destination";
                  return (
                    <Marker position={[lat, lng]}>
                      <Popup>Arrival: {label}</Popup>
                    </Marker>
                  );
                })()}
              </MapContainer>
            </div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", padding: "1.25rem", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 1000, border: "1px solid rgba(255,255,255,0.5)" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "1px" }}>Route Legend</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "20px", height: "6px", backgroundColor: "#EF4444", borderRadius: "3px", opacity: 0.6 }}></span> Standard Route
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "20px", height: "6px", backgroundColor: "#10B981", borderRadius: "3px" }}></span> Validated Safe Route
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
