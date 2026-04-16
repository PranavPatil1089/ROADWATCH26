export function getRisk(d) {
  if (d.accident === 0 && d.traffic <= 1 && d.weather === 0) return "LOW";
  if (!d.isReliable) return "LOW";

  // Score mapping: >=6 is High, 3-5 is Medium, <3 is Low
  if (d.riskScore >= 6) return "HIGH";
  if (d.riskScore >= 3) return "MEDIUM";
  return "LOW";
}

export function getReason(d) {
  if (d.accident === 0 && d.traffic <= 1 && d.weather === 0) return "Normal driving conditions validated.";
  if (!d.isReliable || d.riskScore < 3) return "Normal driving conditions validated.";

  const reasons = [];
  if (d.traffic >= 2) reasons.push("Elevated traffic density");
  if (d.weather > 0) reasons.push(`Hazardous weather: ${d.currentWeatherCondition}`);
  if (d.signal === 0) reasons.push("Absent automated signaling");
  if (d.accident > 0) reasons.push("Historic collision zone");

  return reasons.length ? reasons.join(", ") : "Undetermined complex factors";
}

export function getSuggestion(d) {
  if (getRisk(d) === "LOW") return "No immediate intervention required.";

  const suggestions = [];
  
  // "Install signal" only if: signal === 0 AND traffic >= 2
  if (d.signal === 0 && d.traffic >= 2) {
    suggestions.push("Prioritize infrastructure: Install primary traffic signaling");
  }

  if (d.weather > 0) {
    suggestions.push("Activate localized extreme weather LED hazard warnings");
  }
  
  if (d.traffic >= 3 && d.signal !== 0) {
    suggestions.push("Modify existing signal cycle timing (Green +30s phase)");
  }

  return suggestions.length ? suggestions.join(" | ") : "Routine patrol reinforcement";
}
