// components/HabitabilityCard.tsx
import React from 'react';
import type { HabitabilityAnalysis } from '../types';
import { LeafIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface HabitabilityCardProps {
    analysis: HabitabilityAnalysis;
}

const HabitabilityCard: React.FC<HabitabilityCardProps> = ({ analysis }) => {
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-300';
        if (score >= 6) return 'text-cyan-300';
        if (score >= 4) return 'text-yellow-300';
        if (score >= 2) return 'text-orange-300';
        return 'text-red-400';
    };

    if (!analysis) {
        return null;
    }

    return (
        <div className="bg-space-dark/30 p-4 rounded-md border border-space-light/50 h-full">
            <h4 className="font-display text-accent-gold text-lg flex items-center mb-3">
                <LeafIcon className="w-5 h-5 mr-2" />
                AI Habitability Analysis
            </h4>
            <div className="text-center mb-3">
                <p className="text-sm text-gray-400">Habitability Score</p>
                <p className={`text-5xl font-bold font-display ${getScoreColor(analysis.score)}`}>
                    {analysis.score.toFixed(1)}<span className="text-2xl text-gray-400">/10</span>
                </p>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <ReactMarkdown>{analysis.rationale}</ReactMarkdown>
            </div>
        </div>
    );
};

export default HabitabilityCard;