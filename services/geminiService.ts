// services/geminiService.ts
import { GoogleGenAI, Chat } from "@google/genai";
import { CHATBOT_SYSTEM_INSTRUCTION } from '../constants';

// The API key is expected to be available as process.env.API_KEY
// in the execution environment as per the project guidelines.
export const isApiKeySet = !!process.env.API_KEY;

let ai: GoogleGenAI;

if (isApiKeySet) {
  // FIX: Initialize GoogleGenAI with a named apiKey parameter as per guidelines.
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
} else {
  // This message will be visible in the server/build logs, not the browser console.
  console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

export const createChat = (): Chat | null => {
  if (!ai) {
    return null;
  }
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: CHATBOT_SYSTEM_INSTRUCTION,
    },
  });
};

export const getAiModels = () => {
    if (!ai) {
        throw new Error("Gemini AI not initialized. API key is missing.");
    }
    return ai.models;
}
