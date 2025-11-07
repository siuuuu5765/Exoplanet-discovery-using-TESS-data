// services/geminiService.ts
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { ChatMessage, PlanetAnalysis, BlsParameters, LightCurvePoint, BlsResultPoint, PhaseFoldedPoint, RadialVelocityPoint } from '../types';

/**
 * Creates a new GoogleGenAI instance for each API call.
 * This ensures the latest key from the environment is always used.
 * @returns A configured GoogleGenAI client.
 * @throws An error if the API key is not found in the environment.
 */
// FIX: Switched from `import.meta.env` to `process.env.API_KEY` to follow coding guidelines and fix TypeScript error.
const getAiClient = (): GoogleGenAI => {
    // The API key must be obtained from process.env.API_KEY as per the guidelines.
    // It is assumed to be available in the execution environment (e.g., injected by AI Studio).
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        // This error is thrown if the key is not available, which can happen
        // if the user hasn't selected one through the provided mechanism.
        throw new Error("Gemini API key not found. Please select an API key to proceed.");
    }
    return new GoogleGenAI({ apiKey });
};


// FIX: Export a function to get the models API for various uses.
export const getAiModels = () => {
    const ai = getAiClient();
    return ai.models;
};

// FIX: Function to handle chatbot messaging logic.
export const sendMessageToChatbot = async (message: string, history: ChatMessage[]): Promise<string> => {
    try {
        const ai = getAiClient();
        // We'll create a new chat session for each message to pass the history.
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
const generatePlausibleLightCurve = (analysis: any): LightCurvePoint[] => {
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
    const points: RadialVelocityPoint[] = [];
    const numPoints = 100;
    // Simplified amplitude calculation. A real calculation is much more complex.
    // We'll make the "wobble" proportional to the planet's mass.
    const amplitude = Math.min(20, mass * 0.5); // Plausible amplitude in m/s, capped for realism.
    
    for (let i = 0; i < numPoints; i++) {
        const time = (i / (numPoints - 1)) * period * 2; // Simulate for two full periods
        const velocity = amplitude * Math.sin((2 * Math.PI * time) / period);
        points.push({ time, velocity });
    }
    return points;
};


// FIX: Function to fetch and analyze data for a given TIC ID.
export const fetchAndAnalyzeTicData = async (ticId: string, blsParams: BlsParameters): Promise<PlanetAnalysis> => {

    const combinedPrompt = `
    **System Role:** You are a scientific data simulation and analysis engine for the TESS Exoplanet Discovery Hub.
    Your SOLE function is to return a valid JSON object. Do not include any text, explanations, or markdown formatting like \`\`\`json before or after the JSON object.

    Your instructions are:
    1.  **Simulate Analysis Parameters ONLY**: Generate a JSON object containing the high-level parameters and analysis results of an exoplanet observation.
    2.  **JSON ONLY**: Your entire response MUST be a single, valid JSON object.
    3.  **DO NOT Generate Data Arrays**: The JSON object should NOT include fields for 'lightCurve', 'blsPowerSpectrum', 'phaseFoldedLightCurve', 'transitFitModel', or 'radialVelocityCurve'. The application will generate these.
    4.  **Generate Plausible Science**: The data should be scientifically plausible. For known exoplanets, reflect their characteristics. For other TIC IDs, generate creative but realistic scenarios.
    5.  **Incorporate User Parameters**: Use the provided BLS parameters (periodRange, depthThreshold, snrCutoff) to inform the 'detection' part of your simulation. The simulated 'blsPeriod' should fall within the 'periodRange'.
    6.  **Optional Fields**: Some fields ('atmosphere', 'habitability', 'research', 'comparisonData') are OPTIONAL. Only include them if you can generate high-quality, scientifically plausible data.
    
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
            
            // Procedurally generate the data-intensive parts.
            const generatedLightCurve = generatePlausibleLightCurve(analysisFromAI);
            const generatedBlsSpectrum = generatePlausibleBlsSpectrum(analysisFromAI.detection.blsPeriod.value);
            const { folded, model } = generatePlausiblePhaseFoldedCurve(
                analysisFromAI.planet.period.value,
                analysisFromAI.detection.transitFitParameters.depth,
                analysisFromAI.detection.transitFitParameters.duration
            );
             const generatedRadialVelocity = generatePlausibleRadialVelocityCurve(
                analysisFromAI.planet.period.value,
                analysisFromAI.planet.mass.value
            );
            
            const fullAnalysisResult: PlanetAnalysis = {
                ...analysisFromAI,
                lightCurve: generatedLightCurve,
                radialVelocityCurve: generatedRadialVelocity,
                detection: {
                    ...analysisFromAI.detection,
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
        // Re-throw the original error, which provides more specific details
        // than a generic message. The UI component will handle displaying it.
        throw error;
    }
};

type BatchAnalysisData = Pick<PlanetAnalysis, 'ticId' | 'detection' | 'classification' | 'planet'>;

export const analyzeTicIdForBatch = async (ticId: string, blsParams: BlsParameters): Promise<BatchAnalysisData> => {
     const combinedPrompt = `
    **System Role:** You are a scientific data simulation engine for batch processing. Your SOLE function is to return a valid JSON object. Do not include any text, explanations, or markdown formatting like \`\`\`json before or after the JSON object.

    Your instructions are:
    1.  **Simulate Core Data**: Generate a JSON object containing only the 'ticId', 'detection', 'classification', and 'planet' fields.
    2.  **JSON ONLY**: Your entire response MUST be a single, valid JSON object.
    3.  **Incorporate User Parameters**: Use the provided Box-fitting Least Squares (BLS) parameters to inform the 'detection' simulation.
    4.  **Efficiency**: This is for a batch job, so be quick and efficient. Do not generate extraneous data.

    **User Task:**
    Generate a lightweight exoplanet analysis JSON object for TIC ID: ${ticId}.
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
            const analysisResult: BatchAnalysisData = JSON.parse(jsonText);
            return analysisResult;
        } catch (parseError) {
            console.error(`Failed to parse batch analysis JSON for TIC ID ${ticId}.`, parseError);
            console.error('--- Raw Model Response ---');
            console.error(response.text);
            console.error('--- End Raw Model Response ---');
            throw new Error(`Batch analysis for ${ticId} failed due to unexpected data format.`);
        }
    } catch (error) {
        console.error(`Error in batch analysis API call for TIC ID ${ticId}:`, error);
        throw error; // Let the caller handle the batch result status
    }
};