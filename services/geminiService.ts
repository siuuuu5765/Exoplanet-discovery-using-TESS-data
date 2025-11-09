// services/geminiService.ts

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import type { ChatMessage, PlanetAnalysis, BlsParameters, LightCurvePoint, BlsResultPoint, PhaseFoldedPoint, RadialVelocityPoint, BatchResult, TransitFitParams, Habitability } from '../types';

/**
 * Creates a new GoogleGenAI instance for each API call.
 * This ensures the latest key from the environment is always used.
 * @returns A configured GoogleGenAI client.
 * @throws An error if the API key is not found in the environment.
 */
const getAiClient = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        throw new Error("Gemini API key not found. Please ensure API_KEY is set in your environment settings.");
    }
    return new GoogleGenAI({ apiKey });
};

export const getAiModels = () => {
    const ai = getAiClient();
    return ai.models;
};

export const sendMessageToChatbot = async (message: string, history: ChatMessage[]): Promise<string> => {
    try {
        const ai = getAiClient();
        const dynamicChat = ai.chats.create({
            model: 'gemini-2.5-pro',
            history: history.filter(m => m.role !== 'system').map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            })),
            config: {
                systemInstruction: "You are TESS-a, a friendly guide to the stars for the TESS Exoplanet Discovery Hub. Your mission is to explain complex space topics in simple, easy-to-understand language. Imagine you're talking to someone who is new to astronomy. Use analogies, avoid jargon where possible, and keep your answers clear and encouraging. Stick to topics about exoplanets, stars, the TESS mission, and the data shown in the app. If asked something unrelated, politely steer the conversation back to space."
            }
        });
        
        const response: GenerateContentResponse = await dynamicChat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error('Error sending message to chatbot:', error);
        return 'I am sorry, but I encountered an error while processing your request. Please try again later.';
    }
};

/**
 * Procedurally generates a plausible light curve based on AI-provided parameters.
 */
const generatePlausibleLightCurve = (analysis: PlanetAnalysis): LightCurvePoint[] => {
    const { period } = analysis.planet;
    const { transitFitParameters } = analysis.detection;
    
    const transitPeriod = period.value;
    const transitDepth = transitFitParameters.depth;
    const transitDurationHours = transitFitParameters.duration;
    
    const lightCurve: LightCurvePoint[] = [];
    const points = 2000;
    const totalTimeHours = 500; // Simulate ~20 days of data

    for (let i = 0; i < points; i++) {
        const time = (i / (points - 1)) * totalTimeHours;
        let brightness = 1.0 + (Math.random() - 0.5) * 0.0005; // Baseline with noise
        
        const periodInHours = transitPeriod * 24;
        if (periodInHours <= 0) continue; // Avoid division by zero

        const timeInCycle = time % periodInHours;
        const transitStart = (periodInHours / 2) - (transitDurationHours / 2);
        const transitEnd = (periodInHours / 2) + (transitDurationHours / 2);
        
        if (timeInCycle > transitStart && timeInCycle < transitEnd) {
             brightness -= transitDepth;
        }
        
        lightCurve.push({ time, brightness });
    }
    return lightCurve;
};

/**
 * Procedurally generates a plausible BLS power spectrum.
 */
const generatePlausibleBlsSpectrum = (bestPeriod: number): BlsResultPoint[] => {
    const spectrum: BlsResultPoint[] = [];
    const periodRange = [1, 20];
    const numPoints = 200;

    for (let i = 0; i < numPoints; i++) {
        const p = periodRange[0] + (i / (numPoints - 1)) * (periodRange[1] - periodRange[0]);
        let power = 5 + Math.random() * 5; // Base noise level
        
        // Create a Gaussian-like peak around the best period
        const peakWidth = 0.5;
        if (Math.abs(p - bestPeriod) < peakWidth * 3) {
            power += 25 * Math.exp(-Math.pow(p - bestPeriod, 2) / (2 * Math.pow(peakWidth, 2)));
        }
        
        spectrum.push({ period: p, power });
    }
    return spectrum;
};

/**
 * Procedurally generates a plausible phase-folded light curve and transit model fit.
 */
const generatePlausiblePhaseFoldedCurve = (period: number, depth: number, duration: number): { folded: PhaseFoldedPoint[], model: PhaseFoldedPoint[] } => {
    const phaseFoldedLightCurve: PhaseFoldedPoint[] = [];
    const modelFit: PhaseFoldedPoint[] = [];
    const transitDurationPhase = (duration / (period * 24));

    // Generate scattered observed points
    for(let i=0; i<300; i++) {
        const phase = Math.random() - 0.5;
        let brightness = 1.0 + (Math.random() - 0.5) * 0.001; // Base brightness with noise
        if (Math.abs(phase) < transitDurationPhase / 2) {
             brightness -= depth * (1 + (Math.random()-0.5) * 0.1); // Add noise to depth
        }
        phaseFoldedLightCurve.push({ phase, brightness });
    }
    phaseFoldedLightCurve.sort((a,b) => a.phase - b.phase);

    // Generate clean model fit line
    for (let phase = -0.5; phase <= 0.5; phase += 0.01) {
        let brightness = 1.0;
        if (Math.abs(phase) < transitDurationPhase / 2) {
             brightness -= depth;
        }
        modelFit.push({ phase, brightness });
    }

    return { folded: phaseFoldedLightCurve, model: modelFit };
};


/**
 * Procedurally generates a plausible radial velocity curve.
 */
const generatePlausibleRadialVelocityCurve = (period: number, mass: number): RadialVelocityPoint[] => {
    // If period or mass is zero or invalid, we can't generate a meaningful curve.
    // Return an empty array to prevent the component from rendering a broken or misleading chart.
    if (!period || period <= 0 || !mass || mass <= 0) {
        return [];
    }

    const points: RadialVelocityPoint[] = [];
    const numPoints = 100;
    // The amplitude of the wobble is related to the planet's mass.
    // This is a simplified model, capped for visual clarity.
    const amplitude = Math.min(20, mass * 0.5); 
    
    for (let i = 0; i < numPoints; i++) {
        const time = (i / (numPoints - 1)) * period * 2; // Simulate for two full periods
        const velocity = amplitude * Math.sin((2 * Math.PI * time) / period);
        points.push({ time, velocity });
    }
    return points;
};

/**
 * Detrends a light curve using a simple moving median filter.
 * This helps remove long-term stellar variability or instrumental drift.
 */
const detrendLightCurve = (lightCurve: LightCurvePoint[], windowSize: number): LightCurvePoint[] => {
    if (windowSize % 2 === 0) windowSize++; // Ensure odd window size for a centered median
    const halfWindow = Math.floor(windowSize / 2);
    
    const trend = lightCurve.map((_, i) => {
        const start = Math.max(0, i - halfWindow);
        const end = Math.min(lightCurve.length, i + halfWindow + 1);
        const window = lightCurve.slice(start, end).map(p => p.brightness);
        window.sort((a, b) => a - b);
        return window[Math.floor(window.length / 2)];
    });

    const detrended = lightCurve.map((point, i) => ({
        time: point.time,
        brightness: point.brightness / trend[i],
    }));

    return detrended;
};

/**
 * Folds a light curve at a given period and epoch (t0).
 * The resulting phase is centered at 0, ranging from -0.5 to 0.5.
 */
export const phaseFoldLightCurve = (lightCurve: LightCurvePoint[], periodDays: number, t0: number): PhaseFoldedPoint[] => {
    const periodHours = periodDays * 24;
    if (periodHours <= 0) return [];
    
    return lightCurve.map(point => {
        const phase = (((point.time - t0) / periodHours) + 0.5) % 1.0 - 0.5;
        return { phase, brightness: point.brightness };
    }).sort((a, b) => a.phase - b.phase);
};

/**
 * Calculates transit parameters (depth, duration, epoch) from a light curve.
 * This provides a more realistic analysis based on the photometric data itself.
 */
const calculateTransitParameters = (
    lightCurve: LightCurvePoint[], // Should be detrended
    periodDays: number
): TransitFitParams => {
    if (lightCurve.length < 20 || periodDays <= 0) {
        return { depth: 0, duration: 0, impactParameter: 0.5, epoch: 0 };
    }

    // First, find an approximate epoch (t0) by locating the time of minimum flux.
    // This serves as the reference point for the first transit.
    const tMinFlux = lightCurve.reduce((prev, curr) => (curr.brightness < prev.brightness ? curr : prev)).time;
    const periodHours = periodDays * 24;
    const epoch = tMinFlux % periodHours;

    const foldedCurve = phaseFoldLightCurve(lightCurve, periodDays, epoch);

    // To calculate the baseline flux, find the median of points outside the transit.
    const outOfTransitPoints = foldedCurve.filter(p => Math.abs(p.phase) > 0.1);
    const medianFlux = outOfTransitPoints.length > 0
        ? [...outOfTransitPoints].map(p => p.brightness).sort((a,b)=>a-b)[Math.floor(outOfTransitPoints.length / 2)]
        : 1.0;

    // To calculate depth, find the minimum flux during the transit.
    const inTransitPoints = foldedCurve.filter(p => Math.abs(p.phase) < 0.05);
    const minTransitFlux = inTransitPoints.length > 0
        ? Math.min(...inTransitPoints.map(p => p.brightness))
        : medianFlux;
        
    const depth = Math.max(0, medianFlux - minTransitFlux);

    // Calculate duration by finding the width of the transit dip.
    const threshold = medianFlux - depth * 0.5;
    const belowThresholdPoints = foldedCurve.filter(p => p.brightness < threshold);
    
    let duration = 0;
    if (belowThresholdPoints.length > 1) {
        const minPhase = Math.min(...belowThresholdPoints.map(p => p.phase));
        const maxPhase = Math.max(...belowThresholdPoints.map(p => p.phase));
        duration = (maxPhase - minPhase) * periodHours;
    }

    return {
        depth,
        duration,
        epoch, // Epoch is the center of the first observed transit (in hours)
        impactParameter: 0.5, // Keep as a mock value, it's difficult to derive simply
    };
};


/**
 * Calculates a weighted habitability score and provides a classification and reasoning.
 */
export const calculateHabitability = (
    planet: PlanetAnalysis['planet'],
    star: PlanetAnalysis['star']
): Habitability => {
    const { temperature, radius, period } = planet;
    const { type: starType } = star;

    // 1. Temperature Score (40%) - Ideal is 288K (Earth)
    const optimalTemp = 288;
    const tempRange = 60; // A wider range for scoring
    // FIX: The 'temperature' property is a direct number, not an object with a 'value' property.
    const tempScore = 10 * Math.exp(-Math.pow(temperature - optimalTemp, 2) / (2 * Math.pow(tempRange, 2)));

    // 2. Radius Score (20%) - Ideal is 0.8-1.8 R_Earth
    let radiusScore = 0;
    const r = radius.value;
    if (r >= 0.8 && r <= 1.8) radiusScore = 10;
    else if (r >= 0.5 && r < 0.8) radiusScore = 10 * ((r - 0.5) / 0.3);
    else if (r > 1.8 && r <= 3.0) radiusScore = 10 * (1 - ((r - 1.8) / 1.2));
    else radiusScore = 0;

    // 3. Orbital Period Score (20%) - Proxy for tidal locking and stability
    let periodScore = 0;
    const p = period.value;
    if (p >= 20 && p <= 400) periodScore = 10;
    else if (p >= 10 && p < 20) periodScore = 10 * ((p - 10) / 10);
    else if (p > 400 && p <= 800) periodScore = 10 * (1 - ((p - 400) / 400));
    else periodScore = 0;

    // 4. Stellar Type Score (20%) - G-type is ideal
    let starTypeScore = 3;
    if (starType.includes('G')) starTypeScore = 10;
    else if (starType.includes('K')) starTypeScore = 8;
    else if (starType.includes('F')) starTypeScore = 7;
    else if (starType.includes('M')) starTypeScore = 6;
    
    const totalScore = (tempScore * 0.4) + (radiusScore * 0.2) + (periodScore * 0.2) + (starTypeScore * 0.2);

    let classification: Habitability['classification'] = 'Unlikely Habitable';
    if (totalScore > 7) classification = 'Potentially Habitable';
    else if (totalScore >= 4) classification = 'Marginal';
    
    // Generate reasoning
    const reasons: string[] = [];
    if (tempScore > 8) reasons.push("its estimated temperature is ideal for liquid water.");
    // FIX: The 'temperature' property is a direct number, not an object with a 'value' property.
    else if (tempScore < 4 && temperature > optimalTemp) reasons.push("it is likely too hot.");
    // FIX: The 'temperature' property is a direct number, not an object with a 'value' property.
    else if (tempScore < 4 && temperature < optimalTemp) reasons.push("it is likely too cold.");
    else reasons.push("its temperature is suboptimal.");

    if (radiusScore > 8) reasons.push("Its size suggests it is a rocky world, similar to Earth.");
    else if (radiusScore < 4) reasons.push("Its size suggests it may be a gas giant or too small to retain an atmosphere.");
    
    if (starTypeScore > 8) reasons.push("It orbits a stable, Sun-like star.");
    else if (starTypeScore < 7) reasons.push("its host star may be prone to flaring or have a short lifespan, impacting long-term habitability.");

    const reasoning = `The '${classification}' rating is based on several factors. A key contributor is ${reasons.join(' Furthermore, ')}`;

    return {
        score: totalScore,
        classification,
        reasoning,
        // FIX: The 'temperature' property is a direct number, not an object with a 'value' property.
        inHabitableZone: temperature > 250 && temperature < 370,
    };
};

/**
 * ADAPTER FUNCTION: Maps the raw AI JSON response to the strict PlanetAnalysis type.
 * This makes the app resilient to minor variations in the AI's output format.
 */
const mapAiResponseToPlanetAnalysis = (aiData: any): PlanetAnalysis => {
    // The AI might return `planetCandidate` instead of `planet`. We handle that here.
    const planetData = aiData.planet || aiData.planetCandidate;

    const defaultClassification = {
        cnn: { 
            bestGuess: 'Planet Candidate', 
            predictions: [{ class: 'Planet Candidate', confidence: 0.99 }],
            explanation: 'A strong, periodic signal consistent with a planetary transit was detected.'
        },
        randomForest: { 
            bestGuess: 'Planet Candidate', 
            predictions: [{ class: 'Planet Candidate', confidence: 0.99 }],
            explanation: 'Key features such as period and depth strongly indicate a planetary candidate.'
        }
    };
    
    const mapped: PlanetAnalysis = {
        ticId: aiData.ticId,
        star: {
            name: aiData.star?.name || `TIC ${aiData.ticId}`,
            type: aiData.star?.stellarType || aiData.star?.type || 'Unknown',
            apparentMagnitude: aiData.star?.apparentMagnitude || aiData.star?.magnitude || 0,
            distance: (aiData.star?.distanceParsecs * 3.26156) || aiData.star?.distance || 0,
        },
        detection: {
            blsPeriod: { value: aiData.detection?.blsPeriodDays || aiData.detection?.blsPeriod?.value || 0, uncertainty: 0 },
            transitFitParameters: {
                depth: aiData.detection?.blsDepth || aiData.detection?.transitFitParameters?.depth || 0,
                duration: aiData.detection?.transitDurationHours || aiData.detection?.transitFitParameters?.duration || 0,
                impactParameter: aiData.detection?.impactParameter || 0.5,
                epoch: aiData.detection?.epochBJD || aiData.detection?.transitFitParameters?.epoch || 0,
            }
        },
        planet: {
            name: planetData?.name || 'Candidate 1',
            period: { value: planetData?.orbitalPeriodDays || planetData?.period?.value || 0, uncertainty: 0 },
            radius: { value: planetData?.radiusEarth || planetData?.radius?.value || 0, uncertainty: 0 },
            mass: { value: planetData?.massEarth || planetData?.mass?.value || 0, uncertainty: 0 },
            temperature: planetData?.equilibriumTemperatureK || planetData?.temperature || 0,
        },
        atmosphere: aiData.atmosphere ? {
            composition: (aiData.atmosphere.compositionIndications || []).map((chem: string) => ({ chemical: chem, percentage: 0 })),
            description: aiData.atmosphere.potentialObservability || "No description."
        } : { composition: [], description: "Atmospheric data not available from model." },
        habitability: { // This will be overwritten by the calculation below
            score: 0,
            classification: 'Unknown',
            reasoning: "Calculating...",
            inHabitableZone: false,
        },
        classification: {
            cnn: aiData.classification?.cnn || defaultClassification.cnn,
            randomForest: aiData.classification?.randomForest || defaultClassification.randomForest
        },
        research: aiData.research ? {
            abstract: aiData.research.abstract || "Abstract not provided by model.",
            summary: aiData.research.summary || "Summary not provided by model."
        } : { abstract: "Research abstract not provided by model.", summary: "Research summary not provided by model." },
        comparisonData: aiData.comparisonData?.similarPlanets?.map((p: any) => ({
            property: `Similar: ${p.name}`,
            value: `P=${p.periodDays}d, R=${p.radiusEarth} R⊕`,
            source: 'Archive'
        })) || [],
    };
    
    // Overwrite the AI's habitability assessment with our own calculated one for consistency
    mapped.habitability = calculateHabitability(mapped.planet, mapped.star);

    return mapped;
}

export const fetchAndAnalyzeTicData = async (ticId: string, blsParams: BlsParameters): Promise<PlanetAnalysis> => {

    const combinedPrompt = `
    **System Role:** You are a scientific data simulation and analysis engine for the TESS Exoplanet Discovery Hub.
    Your SOLE function is to return a valid JSON object. Do not include any text, explanations, or markdown formatting like \`\`\`json before or after the JSON object.

    Your instructions are:
    1.  **Simulate Analysis Parameters ONLY**: Generate a JSON object containing the high-level parameters and analysis results of an exoplanet observation.
    2.  **JSON ONLY**: Your entire response MUST be a single, valid JSON object.
    3.  **DO NOT Generate Data Arrays**: The JSON object should NOT include fields for 'lightCurve', 'blsPowerSpectrum', 'phaseFoldedLightCurve', 'transitFitModel', or 'radialVelocityCurve'. The application will generate these.
    4.  **Include ALL Objects and Key Fields**: The JSON must contain the 'star', 'detection', 'planet', 'classification', and 'research' objects. 
        - The 'star' object MUST include 'name', 'type' (or 'stellarType'), 'apparentMagnitude', and 'distanceParsecs'.
        - The 'planet' object (or 'planetCandidate') MUST include 'name', 'orbitalPeriodDays', 'radiusEarth', 'massEarth', and 'equilibriumTemperatureK'.
        - The 'classification' object MUST contain 'cnn' and 'randomForest' objects. Each should have 'bestGuess' (string), 'predictions' (an array of objects with 'class' ['Planet Candidate', 'Eclipsing Binary', 'Stellar Variability', 'Noise'] and 'confidence' keys, where confidences for all classes approximately sum to 1.0), and a new 'explanation' field (a short, one-sentence string summarizing the reason for the classification based on the data, e.g., 'Detected consistent 7.81-day periodic dips with a depth corresponding to a 2.3 Earth-radius planet.').
        - The 'research' object MUST contain 'abstract' (a scientific abstract of 150-200 words summarizing the discovery, key parameters, and classification) and 'summary' (a more detailed summary of the analysis steps, which MUST conclude with a 3-sentence section on the candidate's habitability potential and recommended future research).
        - Also include plausible 'atmosphere', 'habitability', and 'comparisonData' objects.
    5.  **Generate Plausible Science**: The data should be scientifically plausible. For known exoplanets, reflect their characteristics. For other TIC IDs, generate creative but realistic scenarios. The classification confidence scores should be realistic, not always 99%.
    6.  **Incorporate User Parameters**: Use the provided BLS parameters (periodRange, depthThreshold, snrCutoff) to inform the 'detection' part of your simulation. The simulated 'blsPeriod' should fall within the 'periodRange'.
    
    **User Task:**
    Generate a complete exoplanet analysis JSON object for TIC ID: ${ticId}.
    Use the following BLS parameters to guide the signal detection simulation:
    - Period Range: ${blsParams.periodRange[0]} to ${blsParams.periodRange[1]} days
    - Depth Threshold: ${blsParams.depthThreshold}
    - SNR Cutoff: ${blsParams.snrCutoff}
    
    Your response must begin with \`{\` and end with \`}\`.
    `;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: combinedPrompt
        });
        
        let jsonText = response.text.trim();
        
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }

        try {
            const analysisFromAI = JSON.parse(jsonText);
            const mappedAnalysis = mapAiResponseToPlanetAnalysis(analysisFromAI);
            
            // Generate a plausible "raw" light curve based on AI seed parameters.
            const generatedLightCurve = generatePlausibleLightCurve(mappedAnalysis);

            // --- Analysis Pipeline ---
            // 1. Detrend the light curve to remove noise and stellar variability.
            const detrendedLightCurve = detrendLightCurve(generatedLightCurve, 101);

            // 2. Calculate transit parameters from the detrended data.
            // We trust the AI's detected period as the input for this calculation.
            const periodDays = mappedAnalysis.planet.period.value;
            let finalAnalysis = mappedAnalysis;

            if (periodDays > 0) {
                const calculatedParams = calculateTransitParameters(detrendedLightCurve, periodDays);
                finalAnalysis = {
                    ...mappedAnalysis,
                    detection: {
                        ...mappedAnalysis.detection,
                        transitFitParameters: calculatedParams,
                    },
                };
            }

            // 3. Generate visualization data using the newly calculated parameters for consistency.
            const generatedBlsSpectrum = generatePlausibleBlsSpectrum(finalAnalysis.detection.blsPeriod.value);
            const { folded, model } = generatePlausiblePhaseFoldedCurve(
                finalAnalysis.planet.period.value,
                finalAnalysis.detection.transitFitParameters.depth,
                finalAnalysis.detection.transitFitParameters.duration
            );
             const generatedRadialVelocity = generatePlausibleRadialVelocityCurve(
                finalAnalysis.planet.period.value,
                finalAnalysis.planet.mass.value
            );
            
            const fullAnalysisResult: PlanetAnalysis = {
                ...finalAnalysis,
                lightCurve: detrendedLightCurve, // Use the cleaner, detrended curve for plots
                radialVelocityCurve: generatedRadialVelocity,
                detection: {
                    ...finalAnalysis.detection,
                    blsPowerSpectrum: generatedBlsSpectrum,
                    phaseFoldedLightCurve: folded,
                    transitFitModel: model,
                },
            };

            return fullAnalysisResult;

        } catch (parseError) {
            console.error('Failed to parse JSON response from the AI model.', parseError);
            console.error('--- Raw Model Response ---');
            console.error(response.text);
            console.error('--- End Raw Model Response ---');
            throw new Error('The AI model returned data in an unexpected format. Please try again.');
        }

    } catch (error) {
        console.error(`Error analyzing TIC ID ${ticId}:`, error);
        throw error;
    }
};


const mapBatchResponseToBatchData = (aiData: any, ticId: string): Omit<BatchResult, 'status'> => {
     const planetData = aiData.planet || aiData.planetCandidate;
     const defaultBatchClassification = {
        cnn: { bestGuess: 'Planet Candidate', predictions: [] },
        randomForest: { bestGuess: 'Planet Candidate', predictions: [] }
    };
     return {
        ticId: ticId,
        detection: {
            blsPeriod: { value: aiData.detection?.blsPeriodDays || 0, uncertainty: 0 },
            transitFitParameters: {
                depth: aiData.detection?.blsDepth || 0,
                duration: aiData.detection?.transitDurationHours || 0,
                impactParameter: 0.5,
                epoch: aiData.detection?.epochBJD || 0,
            }
        },
        planet: {
            name: planetData?.name || 'Candidate 1',
            period: { value: planetData?.orbitalPeriodDays || 0, uncertainty: 0 },
            radius: { value: planetData?.radiusEarth || 0, uncertainty: 0 },
            mass: { value: planetData?.massEarth || 0, uncertainty: 0 },
            temperature: planetData?.equilibriumTemperatureK || 0,
        },
        classification: {
            cnn: aiData.classification?.cnn || defaultBatchClassification.cnn,
            randomForest: aiData.classification?.randomForest || defaultBatchClassification.randomForest
        },
     };
}


export const analyzeTicIdForBatch = async (ticId: string, blsParams: BlsParameters): Promise<Omit<BatchResult, 'status'>> => {
     const combinedPrompt = `
    **System Role:** You are a scientific data simulation engine for batch processing. Your SOLE function is to return a valid JSON object. Do not include any text, explanations, or markdown formatting.

    Your instructions are:
    1.  **Simulate Core Data**: Generate a JSON object containing only the 'detection', 'classification', and 'planet' (or 'planetCandidate') fields.
    2.  **JSON ONLY**: Your entire response MUST be a single, valid JSON object.
    3.  **Realistic Probabilities**: The 'classification' object should contain 'cnn' and 'randomForest' objects with a 'bestGuess' and a 'predictions' array. The confidence scores in the predictions should be varied and realistic, not always 99%.
    4.  **Incorporate User Parameters**: Use the provided BLS parameters to inform the 'detection' simulation.
    5.  **Efficiency**: This is for a batch job, so be quick and efficient.

    **User Task:**
    Generate a lightweight exoplanet analysis JSON object for TIC ID: ${ticId}.
    Use BLS parameters: Period Range: ${blsParams.periodRange.join('-')} days, Depth Threshold: ${blsParams.depthThreshold}, SNR Cutoff: ${blsParams.snrCutoff}.
    
    Your response must begin with \`{\` and end with \`}\`.
    `;
    
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: combinedPrompt
        });
        
        let jsonText = response.text.trim();
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }

        try {
            const analysisResult = JSON.parse(jsonText);
            return mapBatchResponseToBatchData(analysisResult, ticId);
        } catch (parseError) {
            console.error(`Failed to parse batch analysis JSON for TIC ID ${ticId}.`, parseError);
            console.error('--- Raw Model Response ---');
            console.error(response.text);
            console.error('--- End Raw Model Response ---');
            throw new Error(`Batch analysis for ${ticId} failed due to unexpected data format.`);
        }
    } catch (error) {
        console.error(`Error in batch analysis API call for TIC ID ${ticId}:`, error);
        throw error;
    }
};