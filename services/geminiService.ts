import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ExoplanetData } from '../types';
import { CHATBOT_SYSTEM_INSTRUCTION } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const exoplanetSchema = {
  type: Type.OBJECT,
  properties: {
    isExoplanetHost: { type: Type.BOOLEAN, description: 'True if the TIC ID corresponds to a star with a confirmed exoplanet.' },
    planetName: { type: Type.STRING, description: 'The official name of the exoplanet (e.g., "TOI 700 d"). Null if not an exoplanet host.' },
    orbitalPeriod: { type: Type.NUMBER, description: 'The orbital period of the planet in Earth days.' },
    planetRadius: { type: Type.NUMBER, description: 'The radius of the planet in Earth radii.' },
    starName: { type: Type.STRING, description: 'The common name of the host star.' },
    starType: { type: Type.STRING, description: 'The spectral type of the host star (e.g., "M-dwarf", "G-type").' },
    distance: { type: Type.NUMBER, description: 'Distance from Earth in light-years.' },
    discoveryDate: { type: Type.STRING, description: 'The year the exoplanet was discovered or confirmed.' },
    description: { type: Type.STRING, description: 'A brief, engaging one-paragraph description of the planetary system, including a justification for the calculated habitability score.' },
    habitableZone: { type: Type.BOOLEAN, description: 'True if the planet orbits within the star\'s habitable zone (the "Goldilocks" zone).' },
    habitabilityScore: { type: Type.NUMBER, description: 'A score from 0 to 10 indicating the planet\'s potential for habitability, based on its size, orbital distance, and host star type.' },
    chemicalComposition: {
      type: Type.ARRAY,
      description: 'The dominant chemical composition of the planet\'s atmosphere. Provide 3-5 key chemicals and their approximate percentages. The percentages should add up to roughly 100.',
      items: {
        type: Type.OBJECT,
        properties: {
          chemical: { type: Type.STRING, description: 'The name of the chemical (e.g., "Nitrogen", "Oxygen", "Methane").' },
          percentage: { type: Type.NUMBER, description: 'The percentage of this chemical in the atmosphere.' },
        },
        required: ['chemical', 'percentage'],
      },
    },
    lightCurveData: {
      type: Type.ARRAY,
      description: 'Simulated light curve data showing a single transit. Should have around 50 points. The brightness should dip to about 0.995 at the center of the transit and be 1.0 otherwise.',
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.NUMBER, description: 'Time in hours.' },
          brightness: { type: Type.NUMBER, description: 'Normalized stellar brightness.' },
        },
      },
    },
    radialVelocityData: {
      type: Type.ARRAY,
      description: 'Simulated radial velocity data for the host star, showing its "wobble" due to the planet\'s gravity. This should be a sine wave with a period that matches the planet\'s orbital period. Generate about 50 data points.',
      items: {
        type: Type.OBJECT,
        properties: {
            time: { type: Type.NUMBER, description: 'Time in days, covering roughly one orbital period.' },
            velocity: { type: Type.NUMBER, description: 'The star\'s radial velocity in m/s (positive is away, negative is towards).' },
        }
      }
    }
  },
  required: ['isExoplanetHost', 'planetName', 'orbitalPeriod', 'planetRadius', 'starName', 'starType', 'distance', 'discoveryDate', 'description', 'chemicalComposition', 'lightCurveData', 'radialVelocityData', 'habitableZone', 'habitabilityScore'],
};

export const getExoplanetData = async (ticId: string): Promise<ExoplanetData> => {
  try {
    const prompt = `You are a simulated TESS (Transiting Exoplanet Survey Satellite) astronomical database, optimized for an award-winning science project.
    Given the TESS Input Catalog ID (TIC ID): "${ticId}", provide detailed and scientifically plausible information about it.
    - If the TIC ID is a known exoplanet host, provide its real data.
    - If it's a real TIC ID but not a known exoplanet host, set 'isExoplanetHost' to false and provide plausible but clearly marked as fictional data for an interesting potential planet.
    - If the TIC ID format is invalid or nonsensical, treat it as a fictional star system and generate creative but scientifically plausible data for a fascinating exoplanet.
    - **Crucially, calculate a Habitability Score from 0 (uninhabitable) to 10 (potentially Earth-like).** This score should be based on factors like:
      1.  **Stellar Habitable Zone:** Is the planet's orbit (derived from its period and the star's type) within the 'Goldilocks Zone'? (Primary factor).
      2.  **Planet Size:** Is it a terrestrial planet (higher score) or a gas giant (lower score)? (Use planetRadius).
      3.  **Star Type:** Stable stars like G-type are more favorable than volatile M-dwarfs.
    - **Generate simulated radial velocity data.** This data should represent the star's wobble caused by the orbiting planet. The data must form a clear sine wave, and its period MUST correspond to the planet's 'orbitalPeriod'.
    - Generate a plausible atmospheric chemical composition.
    - The light curve data must simulate a clear transit dip.
    - The main description should include a brief justification for the habitability score.
    Return the data in the specified JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: exoplanetSchema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText) as ExoplanetData;
    return data;
  } catch (error) {
    console.error("Error fetching exoplanet data from Gemini:", error);
    throw new Error("Failed to retrieve or parse exoplanet data. The star may not be in our catalog or there was a communication issue.");
  }
};

export const createChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: CHATBOT_SYSTEM_INSTRUCTION,
    },
  });
};
