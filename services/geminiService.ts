// services/geminiService.ts
// FIX: Import GenerateContentResponse to correctly type API call results.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { VerifiedSystemProfile, ComparisonData, HabitabilityAnalysis, AtmosphericComposition } from '../types';

// --- Retry Logic for API Calls ---
const MAX_RETRIES = 5;

/**
 * A wrapper function that adds retry logic with exponential backoff to an API call.
 * This is crucial for handling transient errors like 503 "model overloaded".
 * @param apiCall The asynchronous function to execute.
 * @returns The result of the API call.
 */
const withRetry = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    let lastError: Error | null = null;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            // Check for specific transient error messages from the Gemini API
            if (error.message.includes('503') || error.message.includes('UNAVAILABLE') || error.message.toLowerCase().includes('overloaded')) {
                // Exponential backoff with jitter to spread out retry attempts
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.warn(`Attempt ${i + 1} failed with a transient error. Retrying in ${delay.toFixed(0)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Not a retryable error, so we throw it immediately
                throw error;
            }
        }
    }
    // If all retries fail, throw the last captured error
    console.error("All retry attempts failed.");
    throw lastError;
};


// Centralized function to create a new AI client instance.
// This ensures we always use the latest API key from the environment.
const getAiClient = () => {
    // The GoogleGenAI constructor will throw an error if API_KEY is missing.
    // This will be caught by the calling function in ExoplanetFinder.tsx.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// A utility function to safely stringify the profile for the prompt
const stringifyProfile = (profile: VerifiedSystemProfile): string => {
    const profileCopy = JSON.parse(JSON.stringify(profile));
    const replacer = (key: string, value: any) => value === "Not Available" ? "Data Not Available From Source" : value;
    return JSON.stringify(profileCopy, replacer, 2);
};

export const generateComprehensiveAiReport = async (
    profile: VerifiedSystemProfile,
    blsParams: { periodRange: [number, number]; snr: number; transitDepth: number }
): Promise<{
    aiAnalysis: string;
    comparisonData: ComparisonData[];
    researchSummary: string;
    atmosphericComposition: AtmosphericComposition;
}> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-pro';
    const profileString = stringifyProfile(profile);

    const prompt = `
        As an expert astrophysicist, conduct a comprehensive analysis of the provided astronomical data for the system around TIC ${profile.TIC_ID}.

        **Verified Data:**
        \`\`\`json
        ${profileString}
        \`\`\`

        **User-Defined Search Parameters:**
        - Period Range Searched: ${blsParams.periodRange[0]} to ${blsParams.periodRange[1]} days
        - Signal-to-Noise Ratio (SNR) Threshold: ${blsParams.snr}
        - Minimum Transit Depth Searched: ${blsParams.transitDepth} ppm

        Based on all available information, perform the following tasks and provide the output in a single, consolidated JSON object.

        **Tasks:**
        1.  **Scientific Analysis:** Provide a concise scientific analysis in Markdown format. Address:
            - A brief overview of the host star.
            - An evaluation of the planet candidate (size, orbit, potential composition).
            - A confidence assessment of the signal.
        2.  **Comparison Table:** Create a comparison table of the planet candidate against Earth and Jupiter.
        3.  **Atmospheric Prediction:** Predict a plausible atmospheric composition. Consider the planet's mass, radius, temperature, and the star's characteristics. Provide the top 3-5 gases and a scientific rationale.
        4.  **Research Proposal:** Propose 3-4 compelling follow-up research questions or observation strategies as a Markdown bulleted list.

        **Output format MUST be a single JSON object with four keys: "aiAnalysis" (string), "comparisonData" (array of objects), "atmosphericComposition" (object), and "researchSummary" (string).**
    `;

    // FIX: Add GenerateContentResponse type to the response variable to resolve type errors.
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    aiAnalysis: { type: Type.STRING },
                    comparisonData: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                parameter: { type: Type.STRING },
                                candidate: { type: Type.STRING },
                                earth: { type: Type.STRING },
                                jupiter: { type: Type.STRING },
                            },
                            required: ['parameter', 'candidate', 'earth', 'jupiter']
                        }
                    },
                    atmosphericComposition: {
                        type: Type.OBJECT,
                        properties: {
                            gases: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        gas: { type: Type.STRING },
                                        percentage: { type: Type.NUMBER },
                                    },
                                    required: ['gas', 'percentage']
                                }
                            },
                            rationale: { type: Type.STRING }
                        },
                        required: ['gases', 'rationale']
                    },
                    researchSummary: { type: Type.STRING }
                },
                required: ['aiAnalysis', 'comparisonData', 'atmosphericComposition', 'researchSummary']
            }
        }
    }));
    const text = response.text;
    if (!text) {
        throw new Error("AI response did not match the expected JSON format.");
    }
    const parsedJson = JSON.parse(text);

    // Basic validation
    if (
        typeof parsedJson.aiAnalysis === 'string' &&
        Array.isArray(parsedJson.comparisonData) &&
        typeof parsedJson.researchSummary === 'string' &&
        typeof parsedJson.atmosphericComposition?.rationale === 'string' &&
        Array.isArray(parsedJson.atmosphericComposition?.gases)
    ) {
        return parsedJson;
    } else {
        throw new Error("AI response did not match the expected JSON format.");
    }
};

// This function is now deterministic and local, no AI call.
export const generateHabitabilityAnalysis = async (profile: VerifiedSystemProfile): Promise<HabitabilityAnalysis> => {
    const { Star, Planet } = profile;
    const components: HabitabilityAnalysis['Components'] = {
        Temperature_Score: 'Not Available',
        Flux_Score: 'Not Available',
        Size_Score: 'Not Available',
        Gravity_Score: 'Not Available',
        Orbit_Stability_Score: 'Not Available',
    };
    let missingParams: string[] = [];

    // 1. Surface Temperature Score
    const T_eq = Planet.Equilibrium_Temperature_K;
    if (typeof T_eq === 'number') {
        const tempScore = Math.max(0, 1 - Math.abs(T_eq - 288) / 100);
        components.Temperature_Score = parseFloat(tempScore.toFixed(2));
    } else {
        missingParams.push("Equilibrium Temperature");
    }

    // 2. Stellar Flux Score
    const L_sun = Star.Luminosity_Lsun;
    const a_au = Planet.SemiMajorAxis_AU; 
    if (typeof L_sun === 'number' && typeof a_au === 'number' && a_au > 0) {
        const flux = L_sun / (a_au * a_au);
        const fluxScore = Math.max(0, 1 - Math.abs(flux - 1) / 1);
        components.Flux_Score = parseFloat(fluxScore.toFixed(2));
    } else {
        if(typeof L_sun !== 'number') missingParams.push("Stellar Luminosity");
        if(typeof a_au !== 'number') missingParams.push("Planet Semi-Major Axis");
    }

    // 3. Planet Size Score
    const R_earth = Planet.Planet_Radius_Rearth;
    if (typeof R_earth === 'number') {
        const sizeScore = Math.max(0, 1 - Math.abs(R_earth - 1) / 1);
        components.Size_Score = parseFloat(sizeScore.toFixed(2));
    } else {
        missingParams.push("Planet Radius");
    }

    // 4. Gravity Score
    const M_earth = Planet.Planet_Mass_Mearth;
    if (typeof M_earth === 'number' && typeof R_earth === 'number' && R_earth > 0) {
        const g = M_earth / (R_earth * R_earth);
        const gravityScore = Math.max(0, 1 - Math.abs(g - 1) / 1);
        components.Gravity_Score = parseFloat(gravityScore.toFixed(2));
    } else {
        if (typeof M_earth !== 'number') missingParams.push("Planet Mass");
    }

    // 5. Orbit Stability Score
    const P_days = Planet.Orbital_Period_days;
    if (typeof P_days === 'number') {
        const orbitScore = 1 / (1 + Math.exp(-(P_days - 100) / 50));
        components.Orbit_Stability_Score = parseFloat(orbitScore.toFixed(2));
    } else {
        missingParams.push("Orbital Period");
    }

    // Final Score Calculation
    const availableScores = Object.values(components).filter(s => typeof s === 'number') as number[];
    const finalScore = availableScores.length > 0
        ? (availableScores.reduce((a, b) => a + b, 0) / availableScores.length) * 100
        : 0;
    
    let interpretation = `The habitability score of ${finalScore.toFixed(1)}/100 is based on ${availableScores.length} of 5 key metrics. It reflects a preliminary assessment of the planet's potential to support liquid water, not a claim of life.`;
    if (missingParams.length > 0) {
        interpretation += `\n\n**Missing Data:** The calculation could not include the following parameters: ${[...new Set(missingParams)].join(', ')}.`;
    }

    return {
        Habitability_Score: parseFloat(finalScore.toFixed(1)),
        Components: components,
        Interpretation: interpretation,
    };
};

// FIX: Refactor to use systemInstruction and fix duplicate message bug.
export const getChatbotResponse = async (profile: VerifiedSystemProfile, history: any[], question: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);
    
    const systemInstruction = `You are an expert astrophysics chatbot specializing in exoplanets. You are answering questions about the system around the star TIC ${profile.TIC_ID}. Use the following verified data as the single source of truth for all specific parameters of this system. You can use your general knowledge of astronomy and physics to explain concepts or provide context, but you must not contradict the provided data. If a user asks for data that is marked as "Not Available", state that the information is not available from the source. Here is the verified data for the system:\n\n${profileString}`;

    // The 'history' array from the component already contains the latest user message.
    // The 'question' parameter is redundant but we keep the function signature.
    // FIX: Add GenerateContentResponse type to the response variable to resolve type errors.
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: model,
        contents: history as any,
        config: {
            systemInstruction: systemInstruction,
        },
    }));

    if (!response.text) {
        throw new Error("I'm sorry, I encountered an error trying to process your question.");
    }
    return response.text;
};
