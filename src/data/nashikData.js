import rawData from "./csvjson.json";

// Aggregate the 9k dataset entries by location to find the true mean signals
const nodeMap = new Map();

rawData.forEach((d, i) => {
  if (!nodeMap.has(d.location_name)) {
    nodeMap.set(d.location_name, {
      id: i,
      name: d.location_name,
      lat: d.latitude,
      lng: d.longitude,
      trafficSum: 0,
      weatherSum: 0,
      signal: d.signal, // Assuming signal presence is static per location
      accident: 0,
      count: 0
    });
  }
  const node = nodeMap.get(d.location_name);
  node.trafficSum += d.traffic || 0;
  node.weatherSum += d.weather || 0;
  node.accident += d.accident || 0;
  node.count += 1;
});

const locationOverrides = {
  "ABB Circle": { lat: 19.9936, lng: 73.7898 }
};

export const RAW_NASHIK_NODES = Array.from(nodeMap.values()).map(node => {
  const baseLat = locationOverrides[node.name] ? locationOverrides[node.name].lat : node.lat;
  const baseLng = locationOverrides[node.name] ? locationOverrides[node.name].lng : node.lng;
  
  return {
    id: node.id,
    name: node.name,
    lat: Number(baseLat),
    lng: Number(baseLng),
    traffic: Math.round(node.trafficSum / node.count), 
    weather: Math.round(node.weatherSum / node.count),
    signal: node.signal,
    accident: node.accident
  };
});

// REMOVE DUPLICATE LOCATIONS (AND VALIDATE COORDINATES)
const uniqueLocations = [];
const seen = new Set();

RAW_NASHIK_NODES.forEach(node => {
  const lat = Number(node.lat);
  const lng = Number(node.lng);
  
  // DATA VALIDATION CHECK (NASHIK GEOGRAPHIC BOUNDS)
  const isValidCoord = lat >= 18 && lat <= 21 && lng >= 72 && lng <= 75;

  if (!seen.has(node.name) && isValidCoord) {
    seen.add(node.name);
    uniqueLocations.push(node);
  }
});

export const LOCATION_OPTIONS = uniqueLocations.map(d => ({
  label: d.name,
  value: `${Number(d.lat).toFixed(6)},${Number(d.lng).toFixed(6)}`,
  lat: Number(d.lat),
  lng: Number(d.lng)
}));
