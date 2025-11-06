
// services/geminiService.ts
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { ChatMessage, PlanetAnalysis, BlsParameters, LightCurvePoint } from '../types';

/**
 * Creates a new GoogleGenAI instance for each API call.
 * This ensures the latest key from `process.env` is always used.
 * @returns A configured GoogleGenAI client.
 * @throws An error if the API key is not found in the environment.
 */
const getAiClient = (): GoogleGenAI => {
    // The hosting platform injects the API key into process.env.
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

    if (!apiKey) {
        // This should ideally not be reached in a configured environment, but serves as a safeguard.
        throw new Error("Gemini API key not found. Please ensure the API_KEY environment variable is set.");
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

// FIX: Define the full schema for the planet analysis.
const planetAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        ticId: { type: Type.STRING },
        lightCurve: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.NUMBER },
                    brightness: { type: Type.NUMBER },
                },
                required: ['time', 'brightness'],
            },
        },
        radialVelocityCurve: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.NUMBER },
                    velocity: { type: Type.NUMBER },
                },
                required: ['time', 'velocity'],
            },
        },
        detection: {
            type: Type.OBJECT,
            properties: {
                blsPeriod: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.NUMBER },
                        uncertainty: { type: Type.NUMBER },
                    },
                    required: ['value', 'uncertainty'],
                },
                blsPowerSpectrum: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            period: { type: Type.NUMBER },
                            power: { type: Type.NUMBER },
                        },
                        required: ['period', 'power'],
                    },
                },
                phaseFoldedLightCurve: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            phase: { type: Type.NUMBER },
                            brightness: { type: Type.NUMBER },
                        },
                        required: ['phase', 'brightness'],
                    },
                },
                transitFitModel: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            phase: { type: Type.NUMBER },
                            brightness: { type: Type.NUMBER },
                        },
                        required: ['phase', 'brightness'],
                    },
                },
                transitFitParameters: {
                    type: Type.OBJECT,
                    properties: {
                        depth: { type: Type.NUMBER },
                        duration: { type: Type.NUMBER },
                        impactParameter: { type: Type.NUMBER },
                        epoch: { type: Type.NUMBER },
                    },
                    required: ['depth', 'duration', 'impactParameter', 'epoch'],
                },
            },
            required: ['blsPeriod', 'blsPowerSpectrum', 'phaseFoldedLightCurve', 'transitFitModel', 'transitFitParameters'],
        },
        star: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                apparentMagnitude: { type: Type.NUMBER },
                distance: { type: Type.NUMBER },
            },
            required: ['name', 'type', 'apparentMagnitude', 'distance'],
        },
        planet: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                period: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.NUMBER },
                        uncertainty: { type: Type.NUMBER },
                    },
                    required: ['value', 'uncertainty'],
                },
                radius: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.NUMBER },
                        uncertainty: { type: Type.NUMBER },
                    },
                    required: ['value', 'uncertainty'],
                },
                mass: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.NUMBER },
                        uncertainty: { type: Type.NUMBER },
                    },
                    required: ['value', 'uncertainty'],
                },
                temperature: { type: Type.NUMBER },
            },
            required: ['name', 'period', 'radius', 'mass', 'temperature'],
        },
        atmosphere: {
            type: Type.OBJECT,
            properties: {
                composition: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            chemical: { type: Type.STRING },
                            percentage: { type: Type.NUMBER },
                        },
                        required: ['chemical', 'percentage'],
                    },
                },
                description: { type: Type.STRING },
            },
            required: ['composition', 'description'],
        },
        habitability: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                inHabitableZone: { type: Type.BOOLEAN },
                summary: { type: Type.STRING },
            },
            required: ['score', 'inHabitableZone', 'summary'],
        },
        classification: {
            type: Type.OBJECT,
            properties: {
                cnn: {
                    type: Type.OBJECT,
                    properties: {
                        bestGuess: { type: Type.STRING },
                        predictions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    class: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER },
                                },
                                required: ['class', 'confidence'],
                            },
                        },
                    },
                    required: ['bestGuess', 'predictions'],
                },
                randomForest: {
                    type: Type.OBJECT,
                    properties: {
                        bestGuess: { type: Type.STRING },
                        predictions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    class: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER },
                                },
                                required: ['class', 'confidence'],
                            },
                        },
                    },
                    required: ['bestGuess', 'predictions'],
                },
            },
            required: ['cnn', 'randomForest'],
        },
        research: {
            type: Type.OBJECT,
            properties: {
                abstract: { type: Type.STRING },
                summary: { type: Type.STRING },
            },
            required: ['abstract', 'summary'],
        },
        comparisonData: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    property: { type: Type.STRING },
                    value: { type: Type.STRING },
                    source: { type: Type.STRING },
                },
                required: ['property', 'value', 'source'],
            },
        },
    },
    required: [
        'ticId', 'detection', 'star', 'planet', 'classification'
    ],
};

/**
 * Procedurally generates a plausible light curve based on AI-provided parameters.
 * This offloads the data-intensive part from the AI model, improving reliability.
 * @param analysis The analysis object from the AI, missing the light curve.
 * @returns An array of LightCurvePoint objects.
 */
const generatePlausibleLightCurve = (analysis: Omit<PlanetAnalysis, 'lightCurve'>): LightCurvePoint[] => {
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

// FIX: Function to fetch and analyze data for a given TIC ID.
export const fetchAndAnalyzeTicData = async (ticId: string, blsParams: BlsParameters): Promise<PlanetAnalysis> => {

    const systemInstruction = `You are a scientific data simulation and analysis engine for the TESS Exoplanet Discovery Hub.
    When given a TESS Input Catalog (TIC) ID, you must:
    1.  **Simulate Analysis Parameters**: Generate a full JSON object that simulates the output of a comprehensive exoplanet analysis pipeline. This includes signal detection results (BLS), transit fitting, stellar/planetary parameters, and ML classification.
    2.  **Adhere to Schema**: The output MUST strictly conform to the provided JSON schema.
    3.  **IMPORTANT EXCEPTION**: Do NOT generate the \`lightCurve\` array. This is computationally intensive and will be handled by the client application. Omit the \`lightCurve\` property from your JSON response. Focus on providing accurate data for all other fields.
    4.  **Generate Plausible Science**: The data should be scientifically plausible. For known exoplanets, reflect their characteristics. For other TIC IDs, generate creative but realistic scenarios.
    5.  **Incorporate User Parameters**: Use the provided BLS parameters (periodRange, depthThreshold, snrCutoff) to inform the 'detection' part of your simulation. The simulated 'blsPeriod' should fall within the 'periodRange'.
    6.  **Optional Fields**: Some fields ('radialVelocityCurve', 'atmosphere', 'habitability', 'research', 'comparisonData') are OPTIONAL. Only include them if you can generate high-quality, scientifically plausible data.
    The goal is to provide a rich, detailed, and scientifically sound parameter set for the user to explore. Prioritize returning a valid JSON according to the schema.`;

    const prompt = `
    Generate a complete exoplanet analysis JSON object for TIC ID: ${ticId}.
    Use the following BLS parameters to guide the signal detection simulation:
    - Period Range: ${blsParams.periodRange[0]} to ${blsParams.periodRange[1]} days
    - Depth Threshold: ${blsParams.depthThreshold}
    - SNR Cutoff: ${blsParams.snrCutoff}
    
    Ensure the output is a single, valid JSON object that strictly adheres to the schema. Do NOT include the 'lightCurve' field.
    `;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: planetAnalysisSchema,
                systemInstruction: systemInstruction,
            },
        });
        
        let jsonText = response.text.trim();
        
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }

        try {
            const analysisResult: PlanetAnalysis = JSON.parse(jsonText);
            
            // If the model didn't generate a light curve (as instructed), we generate one.
            if (!analysisResult.lightCurve || analysisResult.lightCurve.length === 0) {
                analysisResult.lightCurve = generatePlausibleLightCurve(analysisResult as Omit<PlanetAnalysis, 'lightCurve'>);
            }
            
            return analysisResult;
        } catch (parseError) {
            console.error('Failed to parse JSON response from the AI model.', parseError);
            console.error('--- Raw Model Response ---');
            console.error(response.text);
            console.error('--- End Raw Model Response ---');
            throw new Error('The AI model returned data in an unexpected format. Please try again.');
        }

    } catch (error) {
        console.error(`Error analyzing TIC ID ${ticId}:`, error);
         if (error instanceof Error && error.message.includes('unexpected format')) {
            throw error;
        }
        throw new Error('Failed to retrieve analysis data from the AI model.');
    }
};


const batchAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        ticId: { type: Type.STRING },
        detection: {
            type: Type.OBJECT,
            properties: {
                blsPeriod: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.NUMBER },
                        uncertainty: { type: Type.NUMBER }
                    },
                    required: ['value', 'uncertainty']
                }
            },
            required: ['blsPeriod']
        },
        classification: {
            type: Type.OBJECT,
            properties: {
                cnn: {
                    type: Type.OBJECT,
                    properties: {
                        bestGuess: { type: Type.STRING }
                    },
                    required: ['bestGuess']
                },
                 randomForest: {
                    type: Type.OBJECT,
                    properties: {
                        bestGuess: { type: Type.STRING }
                    },
                    required: ['bestGuess']
                }
            },
            required: ['cnn', 'randomForest']
        },
        planet: {
            type: Type.OBJECT,
            properties: {
                radius: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER } },
                    required: ['value']
                },
                mass: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER } },
                    required: ['value']
                },
                temperature: { type: Type.NUMBER }
            },
            required: ['radius', 'mass', 'temperature']
        }
    },
    required: ['ticId', 'detection', 'classification', 'planet']
};

type BatchAnalysisData = Pick<PlanetAnalysis, 'ticId' | 'detection' | 'classification' | 'planet'>;

export const analyzeTicIdForBatch = async (ticId: string, blsParams: BlsParameters): Promise<BatchAnalysisData> => {
     const systemInstruction = `You are a scientific data simulation engine for batch processing. Given a TESS Input Catalog (TIC) ID, you must simulate ONLY the detection, classification, and core planet parameters (radius, mass, temperature).
    1.  **Simulate Core Data**: Generate a JSON object containing only the 'ticId', 'detection', 'classification', and 'planet' fields.
    2.  **Adhere to Schema**: The output MUST strictly conform to the provided lightweight JSON schema.
    3.  **Incorporate User Parameters**: Use the provided Box-fitting Least Squares (BLS) parameters to inform the 'detection' simulation.
    4.  **Efficiency**: This is for a batch job, so be quick and efficient. Do not generate extraneous data like light curves, research summaries, etc.
    The goal is to quickly classify a list of targets and get their key physical parameters for comparison.`;

    const prompt = `
    Generate a lightweight exoplanet analysis JSON object for TIC ID: ${ticId}.
    Use the following BLS parameters to guide the signal detection simulation:
    - Period Range: ${blsParams.periodRange[0]} to ${blsParams.periodRange[1]} days
    - Depth Threshold: ${blsParams.depthThreshold}
    - SNR Cutoff: ${blsParams.snrCutoff}
    
    Ensure the output is a single, valid JSON object that strictly adheres to the schema.
    `;
    
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: batchAnalysisSchema,
                systemInstruction: systemInstruction,
            },
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