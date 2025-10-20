// components/HabitabilityCard.tsx
import React from 'react';
import type { PlanetAnalysis } from '../types';
import { LeafIcon } from './Icons';
import ChemicalComposition from './ChemicalComposition';

interface HabitabilityCardProps {
  habitability: PlanetAnalysis['habitability'];
  atmosphere: PlanetAnalysis['atmosphere'];
}

// FIX: This component displays a summary of the planet's potential habitability.
const HabitabilityCard: React.FC<HabitabilityCardProps> = ({ habitability, atmosphere }) => {
  const scoreColor = habitability.score > 7 ? 'text-green-400' : habitability.score > 4 ? 'text-yellow-400' : 'text-red-400';
  
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
              <p className="text-sm text-gray-400">Habitability Score</p>
              <p className={`text-5xl font-bold font-mono ${scoreColor}`}>{habitability.score.toFixed(1)}<span className="text-2xl text-gray-400">/10</span></p>
            </div>
            <div className={`text-center mt-3 p-2 rounded-md ${habitability.inHabitableZone ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <p className="font-bold text-sm">
                {habitability.inHabitableZone ? 'Within Habitable Zone' : 'Outside Habitable Zone'}
              </p>
            </div>
            <p className="text-xs text-gray-300 mt-3 text-justify">
              {habitability.summary}
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
