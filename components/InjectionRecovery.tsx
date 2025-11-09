// components/InjectionRecovery.tsx

import React, { useState } from 'react';
import type { InjectionResult, LightCurvePoint } from '../types';
import { getAiModels } from '../services/geminiService';
import { Type } from '@google/genai';
import DetectionEfficiencyHeatmap from './DetectionEfficiencyHeatmap';

// Define the schema for the AI model's JSON response to ensure consistency.
const injectionResultSchema = {
    type: Type.OBJECT,
    properties: {
        recovered: { type: Type.BOOLEAN, description: "True if a signal within 5% of the injected period was found, otherwise false." },
        recoveredPeriod: { type: Type.NUMBER, description: "The period of the strongest detected signal. Return 0 if no clear signal was found." },
    },
    required: ["recovered", "recoveredPeriod"]
}

const InjectionRecovery: React.FC<{ lightCurve: LightCurvePoint[], originalPeriod: number, originalDepth: number }> = ({ lightCurve, originalPeriod, originalDepth }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<InjectionResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    /**
     * Injects a synthetic transit signal into a light curve and asks the AI model to try and recover it.
     * @param period The period of the synthetic transit to inject (in days).
     * @param depth The depth of the synthetic transit to inject (normalized brightness).
     * @returns A promise that resolves to an InjectionResult object.
     */
    const runInjectionTest = async (period: number, depth: number): Promise<InjectionResult> => {
        // Create a deep copy of the light curve to avoid modifying the original data.
        const injectedLightCurve = lightCurve.map(p => ({ ...p }));
        const transitDurationDays = 0.1; // ~2.4 hours, a typical transit duration.

        // Inject a simple, box-shaped transit signal into the light curve.
        for (const point of injectedLightCurve) {
            const periodHours = period * 24;
            const timeInCycle = point.time % periodHours; // Find where we are in the orbital cycle.
            const transitDurationHours = transitDurationDays * 24;
            const transitStart = (periodHours / 2) - (transitDurationHours / 2);
            const transitEnd = (periodHours / 2) + (transitDurationHours / 2);
            
            if (timeInCycle > transitStart && timeInCycle < transitEnd) {
                 point.brightness -= depth; // Lower the brightness during the transit.
            }
        }

        const prompt = `
            Analyze the provided TESS light curve data sample where a synthetic transit signal has been injected.
            Your task is to run a detection algorithm (like Box-fitting Least Squares) to find the strongest periodic signal.

            The injected signal has a period of approximately ${period.toFixed(2)} days.

            A signal is considered "recovered" if you detect a strong periodic signal with a period between ${(period * 0.95).toFixed(2)} and ${(period * 1.05).toFixed(2)} days.

            Your response MUST be a single, valid JSON object adhering to the provided schema. Do not include any text, explanations, or markdown formatting.

            Light Curve Data Sample (first 100 points):
            ${JSON.stringify(injectedLightCurve.slice(0, 100))}
        `;

        try {
            const aiModels = getAiModels();
            const response = await aiModels.generateContent({
                model: 'gemini-2.5-flash', // Flash is efficient for this focused task.
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: injectionResultSchema
                }
            });

            // The AI returns a JSON string, which we parse.
            const result = JSON.parse(response.text);
            return { injectedPeriod: period, injectedDepth: depth, recovered: result.recovered, recoveredPeriod: result.recoveredPeriod };
        } catch (e) {
            console.error(`Injection test failed for P=${period.toFixed(2)}d, D=${depth.toFixed(4)}:`, e);
            // If the API call fails or parsing fails, we assume the signal was not recovered.
            return { injectedPeriod: period, injectedDepth: depth, recovered: false };
        }
    };
    
    /**
     * Runs a full sweep of injection-recovery tests across a grid of periods and depths.
     */
    const runFullSweep = async () => {
        setIsRunning(true);
        setIsLoading(true);
        setResults([]);
        const newResults: InjectionResult[] = [];

        // Define a grid of parameters to test, centered around the original detection.
        const periodSteps = [originalPeriod * 0.5, originalPeriod, originalPeriod * 1.5, originalPeriod * 2];
        const depthSteps = [originalDepth * 0.5, originalDepth, originalDepth * 1.5, originalDepth * 2];

        for (const period of periodSteps) {
            for (const depth of depthSteps) {
                const result = await runInjectionTest(period, depth);
                newResults.push(result);
                setResults([...newResults]); // Update UI incrementally to show progress.
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
            <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">Analysis Validation: Injection-Recovery Test</h3>
            <p className="text-sm text-gray-400 mb-4 text-center max-w-2xl mx-auto">
                This tool tests the reliability of our detection pipeline. We inject synthetic planet signals into the real data and check if our analysis can recover them. This helps us understand the detection limits for different planet sizes and orbits.
            </p>
            <div className="text-center">
                 <button
                    onClick={runFullSweep}
                    className="bg-accent-magenta text-white font-bold py-2 px-6 rounded-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
                    disabled={isLoading || isRunning}
                >
                    {isLoading ? 'Running Sweep...' : isRunning ? 'Sweep Complete' : 'Run Detection Efficiency Sweep'}
                </button>
            </div>
            
            {/* The heatmap component will visualize the results as they come in. */}
            {results.length > 0 && <DetectionEfficiencyHeatmap data={results} />}
        </div>
    );
};

export default InjectionRecovery;