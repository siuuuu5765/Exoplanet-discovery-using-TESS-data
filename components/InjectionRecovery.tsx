// components/InjectionRecovery.tsx

import React, { useState } from 'react';
import type { InjectionResult, LightCurvePoint } from '../types';
import { getAiModels } from '../services/geminiService';
import { Type } from '@google/genai';
import DetectionEfficiencyHeatmap from './DetectionEfficiencyHeatmap';

const injectionResultSchema = {
    type: Type.OBJECT,
    properties: {
        recovered: { type: Type.BOOLEAN },
        recoveredPeriod: { type: Type.NUMBER },
    },
    required: ["recovered", "recoveredPeriod"]
}

const InjectionRecovery: React.FC<{ lightCurve: LightCurvePoint[], originalPeriod: number, originalDepth: number }> = ({ lightCurve, originalPeriod, originalDepth }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<InjectionResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runInjectionTest = async (period: number, depth: number): Promise<InjectionResult> => {
        // Create a new light curve with the injected signal
        const injectedLightCurve = lightCurve.map(p => ({ ...p })); // Deep copy
        const transitDuration = 0.1;

        for (const point of injectedLightCurve) {
            const timeInCycle = (point.time / (period * 24)) % 1;
            const durationInCycle = transitDuration / (period * 24);
            if (timeInCycle > 0.45 && timeInCycle < 0.55 && Math.abs(timeInCycle - 0.5) < durationInCycle / 2) {
                point.brightness -= depth;
            }
        }

        const prompt = `
            Analyze the provided TESS light curve data. A synthetic transit signal has been injected.
            Run a Box-fitting Least Squares (BLS) algorithm to detect the strongest periodic signal.
            The injected signal has a period of approximately ${period.toFixed(2)} days.
            Was a signal recovered with a period between ${period * 0.95} and ${period * 1.05} days?
            Return a JSON object with 'recovered' (boolean) and 'recoveredPeriod' (number, or 0 if not recovered).

            Light Curve Data Sample:
            ${JSON.stringify(injectedLightCurve.slice(0, 100))}
        `;

        try {
            const aiModels = getAiModels();
            const response = await aiModels.generateContent({
                model: 'gemini-2.5-flash', // Flash is fine for this simpler task
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: injectionResultSchema
                }
            });
            const result = JSON.parse(response.text);
            return { injectedPeriod: period, injectedDepth: depth, recovered: result.recovered, recoveredPeriod: result.recoveredPeriod };
        } catch (e) {
            console.error("Injection test failed:", e);
            return { injectedPeriod: period, injectedDepth: depth, recovered: false };
        }
    };
    
    const runFullSweep = async () => {
        setIsRunning(true);
        setIsLoading(true);
        setResults([]);
        const newResults: InjectionResult[] = [];

        const periodSteps = [originalPeriod * 0.5, originalPeriod, originalPeriod * 2];
        const depthSteps = [originalDepth * 0.5, originalDepth, originalDepth * 2];

        for (const period of periodSteps) {
            for (const depth of depthSteps) {
                const result = await runInjectionTest(period, depth);
                newResults.push(result);
                setResults([...newResults]); // Update UI incrementally
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
            
            {results.length > 0 && <DetectionEfficiencyHeatmap data={results} />}
        </div>
    );
};

export default InjectionRecovery;