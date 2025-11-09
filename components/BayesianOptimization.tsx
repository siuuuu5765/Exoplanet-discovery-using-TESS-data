// components/BayesianOptimization.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from 'recharts';
import { phaseFoldLightCurve } from '../services/geminiService';
import type { PlanetAnalysis, LightCurvePoint } from '../types';
import { CpuChipIcon } from './Icons';

interface BayesianOptimizationProps {
    analysis: PlanetAnalysis;
}

interface OptimizationParams {
    period: number;
    duration: number; // in hours
    depth: number; // normalized brightness drop
}

interface BestParams extends OptimizationParams {
    score: number;
}


interface HistoryPoint {
    iteration: number;
    score: number;
    bestScore: number;
}

const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-space-dark/80 p-2 border border-accent-cyan rounded-md shadow-lg text-sm">
                <p className="text-gray-300">Iteration: {data.iteration}</p>
                <p className="text-accent-magenta">Current Score: {data.score.toExponential(2)}</p>
                <p className="text-accent-cyan">Best Score: {data.bestScore.toExponential(2)}</p>
            </div>
        );
    }
    return null;
};


const BayesianOptimization: React.FC<BayesianOptimizationProps> = ({ analysis }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [optimizationHistory, setOptimizationHistory] = useState<HistoryPoint[]>([]);
    const [bestParams, setBestParams] = useState<BestParams | null>(null);
    const [defaultParams, setDefaultParams] = useState<OptimizationParams | null>(null);
    const [defaultScore, setDefaultScore] = useState<number | null>(null);

    const lightCurve = analysis.lightCurve;

    // Reset state when a new analysis is loaded
    useEffect(() => {
        setIsRunning(false);
        setOptimizationHistory([]);
        setBestParams(null);
        setDefaultScore(null);

        const initialParams = {
            period: analysis.detection.blsPeriod.value,
            duration: analysis.detection.transitFitParameters.duration,
            depth: analysis.detection.transitFitParameters.depth,
        };
        setDefaultParams(initialParams);
    }, [analysis]);


    /**
     * Objective function: Calculates a "fit score" for a given set of transit parameters against the light curve.
     * Higher score is better. We invert the sum of squared errors.
     */
    const calculateScore = (params: OptimizationParams, curve: LightCurvePoint[]): number => {
        if (params.period <= 0 || params.duration <= 0 || params.depth <= 0 || !curve || curve.length === 0) {
            return 0;
        }

        const folded = phaseFoldLightCurve(curve, params.period, 0);
        const transitDurationPhase = params.duration / (params.period * 24);
        let sumOfSquaredErrors = 0;

        for (const point of folded) {
            const modelBrightness = (Math.abs(point.phase) < transitDurationPhase / 2) ? (1.0 - params.depth) : 1.0;
            sumOfSquaredErrors += Math.pow(point.brightness - modelBrightness, 2);
        }

        // Avoid division by zero
        if (sumOfSquaredErrors < 1e-9) return 1e9;
        
        return 1 / sumOfSquaredErrors;
    };


    const runOptimization = async () => {
        if (!lightCurve || !defaultParams) return;
        
        setIsRunning(true);
        setOptimizationHistory([]);
        
        const initialScore = calculateScore(defaultParams, lightCurve);
        setDefaultScore(initialScore);
        
        let currentBestParams = { ...defaultParams };
        let currentBestScore = initialScore;
        const history: HistoryPoint[] = [];

        // Define a search space around the initial detected values
        const searchSpace = {
            period: [defaultParams.period * 0.95, defaultParams.period * 1.05],
            duration: [defaultParams.duration * 0.7, defaultParams.duration * 1.3],
            depth: [defaultParams.depth * 0.7, defaultParams.depth * 1.3],
        };

        const totalIterations = 30;

        for (let i = 1; i <= totalIterations; i++) {
            // Simulate Bayesian suggestion: explore randomly for first 5 iterations, then exploit best-known params
            let nextParams: OptimizationParams;
            const exploitationFactor = Math.max(0.05, 1 - (i / totalIterations)); // Range of perturbation shrinks over time

            if (i <= 5) { // Exploration phase
                nextParams = {
                    period: searchSpace.period[0] + Math.random() * (searchSpace.period[1] - searchSpace.period[0]),
                    duration: searchSpace.duration[0] + Math.random() * (searchSpace.duration[1] - searchSpace.duration[0]),
                    depth: searchSpace.depth[0] + Math.random() * (searchSpace.depth[1] - searchSpace.depth[0]),
                };
            } else { // Exploitation phase: perturb the best params found so far
                nextParams = {
                    period: currentBestParams.period + (Math.random() - 0.5) * (searchSpace.period[1] - searchSpace.period[0]) * exploitationFactor,
                    duration: currentBestParams.duration + (Math.random() - 0.5) * (searchSpace.duration[1] - searchSpace.duration[0]) * exploitationFactor,
                    depth: currentBestParams.depth + (Math.random() - 0.5) * (searchSpace.depth[1] - searchSpace.depth[0]) * exploitationFactor,
                };
            }
            
            // Clamp values to stay within search space to prevent divergence
            nextParams.period = Math.max(searchSpace.period[0], Math.min(searchSpace.period[1], nextParams.period));
            nextParams.duration = Math.max(searchSpace.duration[0], Math.min(searchSpace.duration[1], nextParams.duration));
            nextParams.depth = Math.max(searchSpace.depth[0], Math.min(searchSpace.depth[1], nextParams.depth));
            
            const score = calculateScore(nextParams, lightCurve);

            if (score > currentBestScore) {
                currentBestScore = score;
                currentBestParams = { ...nextParams };
            }
            
            history.push({ iteration: i, score, bestScore: currentBestScore });
            setOptimizationHistory([...history]);
            setBestParams({ ...currentBestParams, score: currentBestScore });

            await new Promise(resolve => setTimeout(resolve, 60)); // Small delay for UI update
        }

        setIsRunning(false);
    };

    const improvement = defaultScore && bestParams ? ((bestParams.score / defaultScore) - 1) * 100 : 0;

    return (
        <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
            <h3 className="text-lg font-bold font-display text-accent-cyan mb-3 flex items-center">
                <CpuChipIcon className="w-6 h-6 mr-2" />
                Advanced Parameter Tuning: Bayesian Optimization
            </h3>
            <p className="text-sm text-gray-300 mb-4">
                This tool simulates Bayesian Optimization to intelligently fine-tune the transit parameters (period, duration, depth) to maximize the signal-to-noise ratio, or "fit score", against the observed data.
            </p>
            <div className="text-center mb-6">
                <button
                    onClick={runOptimization}
                    disabled={isRunning}
                    className="bg-accent-magenta text-white font-bold py-2 px-6 rounded-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
                >
                    {isRunning ? 'Optimizing...' : 'Start Optimization'}
                </button>
            </div>
            
            {optimizationHistory.length > 0 && defaultParams && bestParams && defaultScore && (
                 <div className="space-y-6">
                    <div>
                        <h4 className="text-md font-bold font-display text-accent-cyan mb-2 text-center">Optimization History</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <LineChart data={optimizationHistory} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3b4262" />
                                    <XAxis dataKey="iteration" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} label={{ value: 'Iteration', position: 'insideBottom', offset: -15, fill: '#d1d5db' }} />
                                    <YAxis stroke="#9ca3af" tick={{ fill: '#d1d5db' }} scale="log" domain={['auto', 'auto']} allowDataOverflow={true} />
                                    <Tooltip content={<CustomTooltipContent />} />
                                    <Legend wrapperStyle={{ color: '#d1d5db' }} />
                                    <Scatter name="Trial Score" dataKey="score" fill="#ff00ff" shape="cross" />
                                    <Line type="monotone" dataKey="bestScore" name="Best Score" stroke="#00ffff" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 
                    <div className="overflow-x-auto">
                        <h4 className="text-md font-bold font-display text-accent-cyan mb-2 text-center">Parameter Results</h4>
                        <table className="min-w-full text-sm text-center">
                             <thead className="text-gray-400">
                                <tr>
                                    <th className="p-2 font-semibold text-left">Parameter</th>
                                    <th className="p-2 font-semibold">Default</th>
                                    <th className="p-2 font-semibold">Optimized</th>
                                </tr>
                            </thead>
                             <tbody>
                                <tr className="border-t border-space-light/50">
                                    <td className="p-2 font-medium text-left">Period (days)</td>
                                    <td>{defaultParams?.period.toFixed(5)}</td>
                                    <td className="font-bold text-accent-cyan">{bestParams?.period.toFixed(5)}</td>
                                </tr>
                                <tr className="border-t border-space-light/50">
                                    <td className="p-2 font-medium text-left">Duration (hours)</td>
                                    <td>{defaultParams?.duration.toFixed(3)}</td>
                                    <td className="font-bold text-accent-cyan">{bestParams?.duration.toFixed(3)}</td>
                                </tr>
                                 <tr className="border-t border-space-light/50">
                                    <td className="p-2 font-medium text-left">Depth (%)</td>
                                    <td>{(defaultParams.depth * 100).toFixed(4)}</td>
                                    <td className="font-bold text-accent-cyan">{(bestParams.depth * 100).toFixed(4)}</td>
                                </tr>
                                <tr className="border-t-2 border-accent-gold/50">
                                    <td className="p-2 font-bold text-left">Fit Score</td>
                                    <td>{defaultScore?.toExponential(2)}</td>
                                    <td className="font-bold text-accent-gold text-lg">{bestParams.score?.toExponential(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        {improvement > 0 &&
                            <p className="text-center mt-3 text-lg font-bold text-green-400">
                                Score Improvement: +{improvement.toFixed(2)}%
                            </p>
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default BayesianOptimization;
