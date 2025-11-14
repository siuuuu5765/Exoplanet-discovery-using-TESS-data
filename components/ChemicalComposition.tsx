// components/ChemicalComposition.tsx
import React from 'react';
import type { AtmosphericComposition } from '../types';
import { BeakerIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface AtmosphericCompositionCardProps {
    composition: AtmosphericComposition;
}

const GasBar: React.FC<{ gas: string; percentage: number; color: string }> = ({ gas, percentage, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-semibold text-gray-200">{gas}</span>
            <span className="font-mono text-gray-400">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-space-light rounded-full h-2.5">
            <div className={color} style={{ width: `${percentage}%`, height: '100%', borderRadius: '9999px' }}></div>
        </div>
    </div>
);

const gasColors = [
    'bg-sky-500', 
    'bg-green-500', 
    'bg-yellow-500', 
    'bg-red-500', 
    'bg-purple-500',
    'bg-pink-500'
];

const AtmosphericCompositionCard: React.FC<AtmosphericCompositionCardProps> = ({ composition }) => {
    if (!composition || !composition.gases) {
        return null;
    }
    return (
        <div className="bg-space-dark/30 p-4 rounded-md border border-space-light/50 h-full">
            <h4 className="font-display text-accent-gold text-lg flex items-center mb-4">
                <BeakerIcon className="w-5 h-5 mr-2" />
                Predicted Atmosphere
            </h4>
            <div className="space-y-3 mb-4">
                {composition.gases
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((item, index) => (
                        <GasBar key={item.gas} gas={item.gas} percentage={item.percentage} color={gasColors[index % gasColors.length]} />
                ))}
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 border-t border-space-light/50 pt-3">
                <ReactMarkdown>{composition.rationale}</ReactMarkdown>
            </div>
        </div>
    );
};

export default AtmosphericCompositionCard;