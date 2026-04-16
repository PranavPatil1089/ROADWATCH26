/**
 * Weather Service integrating OpenWeatherMap.
 * Falls back to deterministic "Clear" weather if API limits reached or key missing.
 */

export async function getWeather(lat, lng) {
  // Cache to avoid smashing OpenWeather limits when refreshing
  const CACHE_KEY = `weather_cache_${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
  const hit = sessionStorage.getItem(CACHE_KEY);
  if (hit) {
    return JSON.parse(hit);
  }

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  console.log("Weather API Call Initiated. Key present:", !!apiKey);
  if (!apiKey) {
    console.warn("No VITE_WEATHER_API_KEY found. Using local deterministic fallback weather.");
    return { main: "Clear", visibility: 10000, weatherRisk: false };
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`);
    if (!res.ok) {
        console.error("OpenWeather API Failed:", res.status);
        throw new Error(`Weather fetch failed: ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Weather API successful result:", data.weather[0].main);
    
    const main = data.weather[0].main;
    // Strict criteria for weather risk
    const isRisky = ["Rain", "Fog", "Thunderstorm", "Snow", "Mist", "Drizzle", "Squall", "Dust", "Smoke", "Haze"].includes(main);
    
    const parsedData = {
      main: main,
      visibility: data.visibility || 10000,
      weatherRisk: isRisky
    };
    
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsedData));
    return parsedData;
  } catch (error) {
    console.error("OpenWeather API Error:", error);
    return { main: "Clear", visibility: 10000, weatherRisk: false };
  }
}
