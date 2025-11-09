// components/HabitabilityCard.tsx
import React from 'react';
import type { PlanetAnalysis, Habitability } from '../types';
import { LeafIcon } from './Icons';
import ChemicalComposition from './ChemicalComposition';

interface HabitabilityCardProps {
  habitability: Habitability;
  atmosphere: PlanetAnalysis['atmosphere'];
}

const HabitabilityCard: React.FC<HabitabilityCardProps> = ({ habitability, atmosphere }) => {
  const getClassificationStyle = (classification: Habitability['classification']) => {
    switch (classification) {
      case 'Potentially Habitable':
        return {
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/20',
        };
      case 'Marginal':
        return {
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
        };
      case 'Unlikely Habitable':
      default:
        return {
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/20',
        };
    }
  };
  
  const classificationStyle = getClassificationStyle(habitability.classification);
  
  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-lg font-bold font-display text-accent-cyan mb-3 text-center flex items-center justify-center">
        <LeafIcon className="w-6 h-6 mr-2" />
        Habitability Assessment
      </h3>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side: Score and summary */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Classification</p>
              <p className={`text-2xl font-bold font-display ${classificationStyle.textColor}`}>
                {habitability.classification}
              </p>
              <p className={`text-5xl font-bold font-mono ${classificationStyle.textColor} mt-2`}>
                {habitability.score.toFixed(1)}
                <span className="text-2xl text-gray-400">/10</span>
              </p>
              <p className="text-xs text-gray-400">Habitability Score</p>
            </div>
            
            <p className="text-xs text-gray-300 mt-3 text-justify">
              <strong>Reasoning:</strong> {habitability.reasoning}
            </p>
          </div>
        </div>
        
        {/* Right side: Composition */}
        <div>
          <ChemicalComposition composition={atmosphere.composition} />
        </div>
      </div>
    </div>
  );
};

export default HabitabilityCard;