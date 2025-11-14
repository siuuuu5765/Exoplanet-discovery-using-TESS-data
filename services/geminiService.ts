// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { VerifiedSystemProfile, ComparisonData, HabitabilityAnalysis, AtmosphericComposition } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A utility function to safely stringify the profile for the prompt
const stringifyProfile = (profile: VerifiedSystemProfile): string => {
    const profileCopy = JSON.parse(JSON.stringify(profile));
    const replacer = (key: string, value: any) => value === "Not Available" ? "Data Not Available From Source" : value;
    return JSON.stringify(profileCopy, replacer, 2);
};

export const generateAiAnalysis = async (
    profile: VerifiedSystemProfile,
    blsParams: { periodRange: [number, number]; snr: number; transitDepth: number }
): Promise<{ aiAnalysis: string; comparisonData: ComparisonData[] }> => {

    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);

    const prompt = `
        As an expert astrophysicist, analyze the provided verified astronomical data for the system around TIC ${profile.TIC_ID}.

        **Verified Data:**
        \`\`\`json
        ${profileString}
        \`\`\`

        **User-Defined Search Parameters:**
        - Period Range Searched: ${blsParams.periodRange[0]} to ${blsParams.periodRange[1]} days
        - Signal-to-Noise Ratio (SNR) Threshold: ${blsParams.snr}
        - Minimum Transit Depth Searched: ${blsParams.transitDepth} ppm

        Based on all the information above, provide a concise scientific analysis in Markdown format. Address the following:
        1.  **System Overview:** Briefly describe the host star's type, age, and characteristics.
        2.  **Planet Candidate Analysis:** Evaluate the planet candidate. Discuss its size, orbit, and potential composition (e.g., rocky, gas giant, ice giant) based on its radius and mass.
        3.  **Confidence Assessment:** Comment on the likelihood that this is a genuine exoplanet signal, considering the data sources and search parameters.

        Finally, create a comparison table of the planet candidate against Earth and Jupiter in a JSON array format.

        **Output format MUST be a single JSON object with two keys: "aiAnalysis" (string, containing your Markdown analysis) and "comparisonData" (an array of objects).**
        Example for comparisonData: [{"parameter": "Radius (Earth=1)", "candidate": "1.6", "earth": "1", "jupiter": "11.2"}]
    `;
    
    try {
        const response = await ai.models.generateContent({
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
                        }
                    },
                    required: ['aiAnalysis', 'comparisonData']
                }
            }
        });
        const text = response.text;
        const parsedJson = JSON.parse(text);

        // Basic validation
        if (typeof parsedJson.aiAnalysis === 'string' && Array.isArray(parsedJson.comparisonData)) {
            return {
                aiAnalysis: parsedJson.aiAnalysis,
                comparisonData: parsedJson.comparisonData as ComparisonData[],
            };
        } else {
            throw new Error("AI response did not match the expected JSON format.");
        }
    } catch (error) {
        console.error("Error generating AI analysis:", error);
        return { 
            aiAnalysis: "An error occurred while generating the AI analysis. Please check the console for details.",
            comparisonData: []
        };
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

    // 2. Stellar Flux Score (Requires SemiMajorAxis_AU, which is not in the current VerifiedSystemProfile)
    // As per the type definition, this will remain 'Not Available' unless the type is updated.
    const L_sun = Star.Luminosity_Lsun;
    const a_au = (Planet as any).SemiMajorAxis_AU; 
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


export const generateAtmosphericComposition = async (profile: VerifiedSystemProfile): Promise<AtmosphericComposition> => {
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);

    const prompt = `
        Based on the provided verified data for the exoplanet system TIC ${profile.TIC_ID}, predict a plausible atmospheric composition.
        Consider the planet's mass, radius, equilibrium temperature, and the star's characteristics.

        **Verified Data:**
        \`\`\`json
        ${profileString}
        \`\`\`

        Your response MUST be a JSON object with two keys:
        1. "gases": An array of objects, each with "gas" (string) and "percentage" (number). List the top 3-5 most likely gases. Percentages should sum to approximately 100.
        2. "rationale": A brief Markdown string explaining your reasoning based on the provided data (e.g., "Given the planet's high mass and low temperature, it likely retained a dense, hydrogen-dominated atmosphere...").
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
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
                }
            }
        });
        const text = response.text;
        const parsedJson = JSON.parse(text);

        if (typeof parsedJson.rationale === 'string' && Array.isArray(parsedJson.gases)) {
            return parsedJson as AtmosphericComposition;
        } else {
             throw new Error("AI response did not match the expected JSON format for atmospheric composition.");
        }
    } catch (error) {
        console.error("Error generating atmospheric composition:", error);
        return {
            gases: [{ gas: 'Error', percentage: 100 }],
            rationale: "An error occurred while predicting the atmospheric composition."
        };
    }
};

export const generateResearchSummary = async (profile: VerifiedSystemProfile): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);

    const prompt = `
        As an expert astrophysicist reviewing the provided data for TIC ${profile.TIC_ID}, propose 3-4 compelling follow-up research questions or observation strategies.
        
        **Verified Data:**
        \`\`\`json
        ${profileString}
        \`\`\`

        Format your response as a concise Markdown bulleted list. Focus on scientifically valuable next steps, such as:
        - Specific JWST or ground-based telescope observations to characterize the atmosphere.
        - Radial velocity follow-up campaigns to refine mass measurements.
        - Searches for additional planets in the system.

        The response must be a single JSON object with one key: "summary" (string).
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING }
                    },
                    required: ['summary']
                }
            }
        });
        const text = response.text;
        return JSON.parse(text).summary;
    } catch (error) {
        console.error("Error generating research summary:", error);
        return "Failed to generate research summary.";
    }
};


export const getChatbotResponse = async (profile: VerifiedSystemProfile, history: any[], question: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);
    
    const contents = [
        {
            role: 'user',
            parts: [{
                text: `System instruction: You are an expert astrophysics chatbot specializing in exoplanets. You are answering questions about the system around the star TIC ${profile.TIC_ID}. Use the following verified data as the single source of truth for all specific parameters of this system. You can use your general knowledge of astronomy and physics to explain concepts or provide context, but you must not contradict the provided data. If a user asks for data that is marked as "Not Available", state that the information is not available from the source. Here is the verified data for the system:\n\n${profileString}`
            }]
        },
        { role: 'model', parts: [{ text: `Understood. I am ready to answer questions about TIC ${profile.TIC_ID} using the provided data as my primary context.` }] },
        ...history,
        { role: 'user', parts: [{ text: question }] }
    ];

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents as any,
        });
        return response.text;
    } catch (error) {
        console.error("Chatbot API error:", error);
        return "I'm sorry, I encountered an error trying to process your question.";
    }
};