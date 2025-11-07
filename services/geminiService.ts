import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import type { ChatMessage, PlanetAnalysis, BlsParameters, LightCurvePoint, BlsResultPoint, PhaseFoldedPoint, RadialVelocityPoint, BatchResult } from '../types';

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
 * ADAPTER FUNCTION: Maps the raw AI JSON response to the strict PlanetAnalysis type.
 * This makes the app resilient to minor variations in the AI's output format.
 */
const mapAiResponseToPlanetAnalysis = (aiData: any): PlanetAnalysis => {
    // The AI might return `planetCandidate` instead of `planet`. We handle that here.
    const planetData = aiData.planet || aiData.planetCandidate;

    const defaultClassification = {
        cnn: { bestGuess: 'Planet Candidate', predictions: [{ class: 'Planet Candidate', confidence: 0.99 }] },
        randomForest: { bestGuess: 'Planet Candidate', predictions: [{ class: 'Planet Candidate', confidence: 0.99 }] }
    };
    
    const mapped: PlanetAnalysis = {
        ticId: aiData.ticId,
        star: {
            name: aiData.star?.name || `TIC ${aiData.ticId}`,
            type: aiData.star?.stellarType || aiData.star?.type || 'Unknown',
            apparentMagnitude: aiData.star?.apparentMagnitude || 0,
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
        habitability: aiData.habitability ? {
            score: (aiData.habitability.hzdScore || 0) * 10,
            inHabitableZone: !aiData.habitability.status?.toLowerCase().includes('unlikely'),
            summary: aiData.habitability.reason || "No summary."
        } : { score: 0, inHabitableZone: false, summary: "Habitability assessment not available from model." },
        classification: {
            cnn: aiData.classification?.cnn || defaultClassification.cnn,
            randomForest: aiData.classification?.randomForest || defaultClassification.randomForest
        },
         research: aiData.research ? {
            abstract: aiData.research.followUpInvestigations?.join(' ') || "No abstract available.",
            summary: "Research summary was generated by the model."
        } : { abstract: "Research abstract not provided by model.", summary: "Research summary not provided by model." },
        comparisonData: aiData.comparisonData?.similarPlanets?.map((p: any) => ({
            property: `Similar: ${p.name}`,
            value: `P=${p.periodDays}d, R=${p.radiusEarth} R⊕`,
            source: 'Archive'
        })) || [],
    };
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
    4.  **Include ALL Objects**: The JSON must contain the 'star', 'detection', 'planet', 'classification', 'atmosphere', 'habitability', 'research', and 'comparisonData' objects. Provide plausible estimations if real data is scarce.
    5.  **Generate Plausible Science**: The data should be scientifically plausible. For known exoplanets, reflect their characteristics. For other TIC IDs, generate creative but realistic scenarios.
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
            
            // Procedurally generate the data-intensive parts based on the mapped data.
            const generatedLightCurve = generatePlausibleLightCurve(mappedAnalysis);
            const generatedBlsSpectrum = generatePlausibleBlsSpectrum(mappedAnalysis.detection.blsPeriod.value);
            const { folded, model } = generatePlausiblePhaseFoldedCurve(
                mappedAnalysis.planet.period.value,
                mappedAnalysis.detection.transitFitParameters.depth,
                mappedAnalysis.detection.transitFitParameters.duration
            );
             const generatedRadialVelocity = generatePlausibleRadialVelocityCurve(
                mappedAnalysis.planet.period.value,
                mappedAnalysis.planet.mass.value
            );
            
            const fullAnalysisResult: PlanetAnalysis = {
                ...mappedAnalysis,
                lightCurve: generatedLightCurve,
                radialVelocityCurve: generatedRadialVelocity,
                detection: {
                    ...mappedAnalysis.detection,
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
    3.  **Incorporate User Parameters**: Use the provided BLS parameters to inform the 'detection' simulation.
    4.  **Efficiency**: This is for a batch job, so be quick and efficient.

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