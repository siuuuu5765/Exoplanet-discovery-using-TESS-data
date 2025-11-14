// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import type { VerifiedSystemProfile, ComparisonData, HabitabilityAnalysis, AtmosphericComposition } from '../types';

// FIX: Per coding guidelines, initialize without casting API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A utility function to safely stringify the profile for the prompt
const stringifyProfile = (profile: VerifiedSystemProfile): string => {
    // Create a deep copy to avoid modifying the original object
    const profileCopy = JSON.parse(JSON.stringify(profile));
    
    // Replace "Not Available" with a more descriptive string for the model
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
        Example for comparisonData: [{"parameter": "Radius (Earth=1)", "candidate": 1.6, "earth": 1, "jupiter": 11.2}]
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            // FIX: Use responseSchema to ensure reliable JSON output format.
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
                comparisonData: parsedJson.comparisonData,
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

export const generateHabitabilityAnalysis = async (profile: VerifiedSystemProfile): Promise<HabitabilityAnalysis> => {
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);

    const prompt = `
        As an expert astrobiologist, provide a habitability analysis for the exoplanet in the provided data.
        
        **Verified Data:**
        \`\`\`json
        ${profileString}
        \`\`\`
        
        Your analysis must consider the star's type (derived from temperature/luminosity), the planet's equilibrium temperature, and its size (radius/mass) to assess its potential for supporting surface liquid water.

        Return a single JSON object with two keys:
        1. "score": A numerical score from 0 (uninhabitable) to 10 (highly promising).
        2. "rationale": A concise, scientific explanation for your score in Markdown format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            // FIX: Use responseSchema to ensure reliable JSON output format.
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        rationale: { type: Type.STRING },
                    },
                    required: ['score', 'rationale']
                }
            }
        });
        const text = response.text;
        const parsedJson = JSON.parse(text);

        if (typeof parsedJson.score === 'number' && typeof parsedJson.rationale === 'string') {
            return parsedJson;
        } else {
            throw new Error("AI response for habitability did not match expected format.");
        }
    } catch (error) {
        console.error("Error generating habitability analysis:", error);
        return {
            score: 0,
            rationale: "An error occurred during habitability analysis."
        };
    }
};

export const generateAtmosphericComposition = async (profile: VerifiedSystemProfile): Promise<AtmosphericComposition> => {
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);

    const prompt = `
        As an expert planetary scientist and astrochemist, predict a plausible atmospheric composition for the exoplanet based on the provided data.

        **Verified Data:**
        \`\`\`json
        ${profileString}
        \`\`\`
        
        Consider the planet's mass, radius, and equilibrium temperature to infer its likely type (e.g., rocky, mini-Neptune) and predict the primary gases in its atmosphere.

        Return a single JSON object with two keys:
        1. "gases": An array of objects, where each object has "gas" (string, e.g., "Nitrogen") and "percentage" (number). The percentages should sum to roughly 100.
        2. "rationale": A concise, scientific explanation for your prediction in Markdown format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            // FIX: Use responseSchema to ensure reliable JSON output format.
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
                        rationale: { type: Type.STRING },
                    },
                    required: ['gases', 'rationale']
                }
            }
        });
        const text = response.text;
        const parsedJson = JSON.parse(text);

        if (Array.isArray(parsedJson.gases) && typeof parsedJson.rationale === 'string') {
            return parsedJson;
        } else {
            throw new Error("AI response for atmosphere did not match expected format.");
        }
    } catch (error) {
        console.error("Error generating atmospheric composition:", error);
        return {
            gases: [{ gas: "Error", percentage: 100 }],
            rationale: "An error occurred during atmospheric composition analysis."
        };
    }
};


export const generateResearchSummary = async (profile: VerifiedSystemProfile): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);

    const prompt = `
        You are a research assistant at a major astronomical observatory.
        Given the following verified data for a planetary system, propose three specific, actionable next steps for follow-up research.
        
        **Verified Data:**
        \`\`\`json
        ${profileString}
        \`\`\`

        For each research proposal, provide:
        - A clear, concise title.
        - The scientific question it would address.
        - The suggested methodology or required instrumentation (e.g., "High-resolution spectroscopy with JWST," "Long-term radial velocity monitoring with HARPS").

        Format the output as a Markdown list.
    `;
    
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

export const getChatbotResponse = async (
    profile: VerifiedSystemProfile,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    latestMessage: string
): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const profileString = stringifyProfile(profile);

    const systemInstruction = `You are a helpful and knowledgeable astrophysics chatbot. Your purpose is to answer questions about the provided planetary system ONLY.
    Use the provided verified data to answer questions accurately. Do not speculate or provide information from outside this data context. Keep your answers concise.
    
    **Verified Data Context:**
    \`\`\`json
    ${profileString}
    \`\`\`
    `;

    const chat = ai.chats.create({
        model: model,
        config: { systemInstruction },
        history: history
    });

    const response = await chat.sendMessage({ message: latestMessage });
    return response.text;
};