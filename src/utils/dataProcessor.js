import { RAW_NASHIK_NODES } from "../data/nashikData";

export function processLocationData(rawNode, weatherState, currentTimeHour) {
    // 1. Determine time-based traffic
    // Peak hours: 8-11 AM, 5-9 PM (17-21)
    let timeTrafficWeight = 0;
    const isPeakHour = (currentTimeHour >= 8 && currentTimeHour <= 11) || (currentTimeHour >= 17 && currentTimeHour <= 21);
    
    // Simulate real traffic addition
    if (isPeakHour) {
        timeTrafficWeight = 2; 
    }

    // Traffic weight maxes at 3
    const calculatedTraffic = Math.min((rawNode.traffic || 0) + timeTrafficWeight, 3);

    // 2. Weather weight
    const weatherWeight = weatherState.weatherRisk ? 3 : 0;
    
    // 3. Signal weight
    const signalWeight = rawNode.signal === 0 ? 2 : 0;

    // 4. Accident weight (historic base)
    const accidentWeight = rawNode.accident > 5 ? 2 : (rawNode.accident > 0 ? 1 : 0);

    // Deterministic Risk Score
    const score = calculatedTraffic + weatherWeight + signalWeight + accidentWeight;

    // Reliability validation
    // How many factors are contributing?
    const factorsActive = (calculatedTraffic > 1 ? 1 : 0) + (weatherWeight > 0 ? 1 : 0) + (signalWeight > 0 ? 1 : 0) + (accidentWeight > 0 ? 1 : 0);
    
    // If NO factors are severe and there are no accidents, it's highly unreliable to call it risky
    const isReliable = !(rawNode.accident === 0 && calculatedTraffic <= 1 && !weatherState.weatherRisk);

    // Predict ML probability
    // Max achievable score based on weights above: 3 + 3 + 2 + 2 = 10
    const maxScore = 10;
    let probability = score / maxScore;

    if (isPeakHour) {
        probability += 0.05; // Time-based boost as requested
    }

    if (factorsActive <= 1) {
        probability -= 0.15; // Penalty for only one factor active
    }

    probability = Math.max(0, Math.min(1, probability));

    return {
        ...rawNode,
        traffic: calculatedTraffic,
        weather: weatherWeight,
        signal: rawNode.signal,
        accident: rawNode.accident,
        currentWeatherCondition: weatherState.main || "Clear",
        riskScore: score,
        isReliable: isReliable,
        predictRiskScore: probability,
        factorsActive
    };
}

export function getProcessedNashikData(weatherState, currentHour) {
    return RAW_NASHIK_NODES.map(node => processLocationData(node, weatherState, currentHour));
}
