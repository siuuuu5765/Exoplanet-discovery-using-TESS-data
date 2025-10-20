// services/geminiService.ts
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { ChatMessage, PlanetAnalysis } from '../types';

// FIX: Initialize the GoogleGenAI client according to guidelines.
const apiKey = process.env.API_KEY || (import.meta.env && import.meta.env.VITE_API_KEY);
const ai = new GoogleGenAI({ apiKey });

// FIX: Expose the models API for specific use cases like injection-recovery tests.
export const getAiModels = () => {
    return ai.models;
};

const generateSystemInstruction = (analysis?: PlanetAnalysis): string => {
    let instruction = `You are TESS-a, an expert AI assistant specializing in exoplanet data from NASA's TESS mission. Your purpose is to help users understand the provided analysis results. Be concise, helpful, and use a slightly futuristic, scientific tone. The user has just analyzed a star system.`;

    if (analysis) {
        instruction += ` Here is a summary of the current analysis for TIC ${analysis.ticId}:\n`;
        instruction += `- Planet Candidate: ${analysis.planet.name}\n`;
        instruction += `- Orbital Period: ${analysis.planet.period.value.toFixed(2)} days\n`;
        instruction += `- Planet Radius: ${analysis.planet.radius.value.toFixed(2)} Earth radii\n`;
        instruction += `- ML Classification: The primary classification is '${analysis.classification.cnn.bestGuess}'.\n`;
        instruction += `Focus your answers on this specific dataset unless the user asks for general information.`;
    } else {
        instruction += ` There is no specific planet data loaded yet. Answer general questions about TESS, exoplanets, and this application's features.`;
    }
    return instruction;
};

let chat: Chat | null = null;
let lastAnalysisContext: string | null = null;
let currentAnalysisForChat: PlanetAnalysis | null = null;

// FIX: Add a function to set the analysis context for the chatbot from other components.
export const setChatbotContext = (analysis: PlanetAnalysis | null) => {
    currentAnalysisForChat = analysis;
    chat = null; // Force chat reset on context change
};

// FIX: Implement the function to send messages to the Gemini chatbot.
export const sendMessageToChatbot = async (message: string, history: ChatMessage[]): Promise<string> => {
    const analysisContext = currentAnalysisForChat ? JSON.stringify(currentAnalysisForChat.ticId) : null;

    // Reset chat if the context (the analyzed planet) has changed
    if (!chat || lastAnalysisContext !== analysisContext) {
        const systemInstruction = generateSystemInstruction(currentAnalysisForChat);
        const chatHistory = history
            .filter(m => m.role === 'user' || m.role === 'model')
            .map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));
        
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
            history: chatHistory
        });
        lastAnalysisContext = analysisContext;
    }

    try {
        const result: GenerateContentResponse = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to chatbot:", error);
        return "I'm sorry, I encountered an issue while processing your request. Please try again.";
    }
};
