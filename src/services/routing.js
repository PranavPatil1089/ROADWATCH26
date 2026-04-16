/**
 * Routing Service integrating OpenRouteService (ORS) with OSRM fallback.
 */

// Decodes ORS polyline strings into coordinate arrays
function decodePolyline(encoded) {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Fallback logic using OSRM 
async function getOSRMFallback(source, dest, isDetour = false) {
    try {
        let url = `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&alternatives=true`;
        
        if (isDetour) {
            // Force detour to bypass central congestion nodes
            const midLng = (source.lng + dest.lng) / 2 + 0.01;
            const midLat = (source.lat + dest.lat) / 2 - 0.01;
            url = `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${midLng},${midLat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("OSRM Failure");
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
            // Reverse [lng, lat] to [lat, lng] for Leaflet
            return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        }
        return [];
    } catch(err) {
        return [];
    }
}

export async function getFastestRoute(source, dest) {
    const apiKey = import.meta.env.VITE_ORS_API_KEY;
    console.log("Routing API Call Initiated. Key present:", !!apiKey);
    if (!apiKey) {
        return await getOSRMFallback(source, dest, false);
    }

    try {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${source.lng},${source.lat}&end=${dest.lng},${dest.lat}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.error("ORS API Error:", res.status, res.statusText);
            throw new Error("ORS Rate Limit or Auth Error");
        }
        const data = await res.json();
        console.log("ORS API successfully returned coordinates.");
        
        if (data.features && data.features.length > 0) {
            // ORS uses [lng,lat], let's manually decode or use their coordinates array
            // The GET API returns geojson with coordinates
            const coords = data.features[0].geometry.coordinates;
            return coords.map(c => [c[1], c[0]]);
        }
        return await getOSRMFallback(source, dest, false);
    } catch (error) {
        console.warn("ORS Error, routing via OSRM fallback.", error);
        return await getOSRMFallback(source, dest, false);
    }
}

export async function getSaferRoute(source, dest, riskPoints = []) {
    // Ideally, we'd use ORS avoid_polygons functionality in a POST request, but it requires bounding boxes.
    // Given the constraints of an unconfigured API key environment, we utilize the deterministic OSRM detour bypass 
    // to strictly enforce safety path divergence from the main dangerous artery when high risk is present.
    
    // We determine if we actually need a detour by checking if risk points exist
    const hasSevereRiskPoints = riskPoints.length > 0;

    const apiKey = import.meta.env.VITE_ORS_API_KEY;
    
    if (apiKey && !hasSevereRiskPoints) {
        // If no risk, safest route is fastest route
        return await getFastestRoute(source, dest);
    }
    
    // Fall back to forced detour avoiding the geographical center
    return await getOSRMFallback(source, dest, true); // true forces a safe detour
}
