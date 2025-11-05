// services/geminiService.ts
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { ChatMessage, PlanetAnalysis, BlsParameters } from '../types';

/**
 * Creates a new GoogleGenAI instance for each API call.
 * This is crucial for environments where the API key can be selected/changed by the user
 * at any time, ensuring the latest key from `process.env` is always used.
 * @returns A configured GoogleGenAI client.
 * @throws An error if the API key is not found in the environment.
 */
const getAiClient = (): GoogleGenAI => {
    // The hosting platform injects the selected API key into process.env.
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

    if (!apiKey) {
        // This should ideally not be reached if the UI flow is correct, but serves as a safeguard.
        throw new Error("Gemini API key not found. Please select a key before using the application.");
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
                        featureImportance: {
                             type: Type.ARRAY,
                             items: {
                                 type: Type.OBJECT,
                                 properties: {
                                     feature: { type: Type.STRING },
                                     score: { type: Type.NUMBER },
                                 },
                                required: ['feature', 'score']
                             }
                        }
                    },
                    required: ['bestGuess', 'predictions', 'featureImportance'],
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
        'ticId', 'lightCurve', 'radialVelocityCurve', 'detection', 'star', 'planet',
        'atmosphere', 'habitability', 'classification', 'research', 'comparisonData'
    ],
};


// FIX: Function to fetch and analyze data for a given TIC ID.
export const fetchAndAnalyzeTicData = async (ticId: string, blsParams: BlsParameters): Promise<PlanetAnalysis> => {

    const systemInstruction = `You are a scientific data simulation and analysis engine. Your task is to act as the backend for the TESS Exoplanet Discovery Hub.
    When given a TESS Input Catalog (TIC) ID, you must:
    1.  **Simulate Realistic Data**: Generate a full JSON object that simulates the output of a comprehensive exoplanet detection and analysis pipeline. This includes light curve data, radial velocity data, signal detection results (BLS), transit fitting, stellar and planetary parameters, atmospheric composition, habitability assessment, and machine learning classification results.
    2.  **Adhere to Schema**: The output MUST strictly conform to the provided JSON schema. Do not add extra properties or explanations. The entire response must be a single, parsable JSON object.
    3.  **Generate Plausible Science**: The data should be scientifically plausible. For known exoplanets, try to reflect their known characteristics. For other TIC IDs or mock requests, generate creative but realistic scenarios (e.g., hot Jupiters, Earth-like worlds, eclipsing binaries misclassified as planets).
    4.  **Incorporate User Parameters**: Use the provided Box-fitting Least Squares (BLS) parameters (periodRange, depthThreshold, snrCutoff) to inform the 'detection' part of your simulation. The simulated 'blsPeriod' should fall within the 'periodRange'.
    5.  **Create Research Summary**: Write a concise, professional, scientific-style abstract and a longer summary about the findings for the target.
    6.  **Compare Data Sources**: Populate the 'comparisonData' with a few key parameters, comparing your generated 'Gemini' data with plausible 'Archive' data (e.g., from MAST or ExoFOP).
    7.  **Classification**: The 'classification' section should contain results from two models: a 1D CNN and a Random Forest. Provide confidence scores for different classes (Planet Candidate, Eclipsing Binary, Stellar Variability, Noise).
    The goal is to provide a rich, detailed, and scientifically sound dataset for the user to explore in the application.`;

    const prompt = `
    Generate a complete exoplanet analysis JSON object for TIC ID: ${ticId}.
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
                responseSchema: planetAnalysisSchema,
                systemInstruction: systemInstruction,
            },
        });
        
        const jsonText = response.text.trim();
        const analysisResult: PlanetAnalysis = JSON.parse(jsonText);
        return analysisResult;
    } catch (error) {
        console.error(`Error analyzing TIC ID ${ticId}:`, error);
        throw new Error('Failed to retrieve or parse analysis data from the AI model.');
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
    
    const jsonText = response.text.trim();
    const analysisResult: BatchAnalysisData = JSON.parse(jsonText);
    return analysisResult;
};
