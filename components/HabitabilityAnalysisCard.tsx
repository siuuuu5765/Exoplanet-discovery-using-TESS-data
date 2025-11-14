// components/HabitabilityAnalysisCard.tsx
import React from 'react';
import type { HabitabilityAnalysis } from '../types';
import { LeafIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface HabitabilityAnalysisCardProps {
    analysis: HabitabilityAnalysis;
}

const ComponentScore: React.FC<{ label: string; value: number | 'Not Available' }> = ({ label, value }) => {
    const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
    const isAvailable = typeof value === 'number';
    return (
        <div className={`flex justify-between text-xs ${isAvailable ? 'text-gray-300' : 'text-gray-500 italic'}`}>
            <span>{label}</span>
            <span className="font-mono">{displayValue}</span>
        </div>
    );
};


const HabitabilityAnalysisCard: React.FC<HabitabilityAnalysisCardProps> = ({ analysis }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-300';
        if (score >= 60) return 'text-cyan-300';
        if (score >= 40) return 'text-yellow-300';
        if (score >= 20) return 'text-orange-300';
        return 'text-red-400';
    };

    if (!analysis) {
        return null;
    }

    return (
        <div className="bg-space-dark/30 p-4 rounded-md border border-space-light/50 h-full">
            <h4 className="font-display text-accent-gold text-lg flex items-center mb-3">
                <LeafIcon className="w-5 h-5 mr-2" />
                Habitability Analysis
            </h4>
            <div className="text-center mb-4">
                <p className="text-sm text-gray-400">Habitability Score</p>
                <p className={`text-5xl font-bold font-display ${getScoreColor(analysis.Habitability_Score)}`}>
                    {analysis.Habitability_Score.toFixed(0)}<span className="text-2xl text-gray-400">/100</span>
                </p>
            </div>
            
            <div className="space-y-1 text-sm mb-4 border-t border-b border-space-light/50 py-3">
                 <h5 className="text-sm font-semibold text-gray-400 mb-2 text-center">Score Components (0-1)</h5>
                <ComponentScore label="Temperature" value={analysis.Components.Temperature_Score} />
                <ComponentScore label="Stellar Flux" value={analysis.Components.Flux_Score} />
                <ComponentScore label="Planet Size" value={analysis.Components.Size_Score} />
                <ComponentScore label="Gravity" value={analysis.Components.Gravity_Score} />
                <ComponentScore label="Orbit Stability" value={analysis.Components.Orbit_Stability_Score} />
            </div>

            <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <ReactMarkdown>{analysis.Interpretation}</ReactMarkdown>
            </div>
        </div>
    );
};

export default HabitabilityAnalysisCard;
