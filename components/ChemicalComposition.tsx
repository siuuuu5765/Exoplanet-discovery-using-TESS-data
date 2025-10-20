import React from 'react';
// FIX: Corrected import path for type definition
import type { Chemical } from '../types';
// FIX: Corrected import path for Icons component
import { BeakerIcon } from './Icons';

interface ChemicalCompositionProps {
  composition: Chemical[];
}

const chemicalColors: { [key: string]: string } = {
  Nitrogen: 'bg-blue-500',
  Oxygen: 'bg-cyan-400',
  Methane: 'bg-orange-500',
  'Carbon Dioxide': 'bg-gray-500',
  Hydrogen: 'bg-purple-500',
  Helium: 'bg-pink-500',
  'Water Vapor': 'bg-sky-500',
  Ammonia: 'bg-green-500',
  Default: 'bg-indigo-500',
};

const getChemicalColor = (chemical: string) => {
    const keys = Object.keys(chemicalColors);
    const foundKey = keys.find(key => chemical.toLowerCase().includes(key.toLowerCase()));
    return foundKey ? chemicalColors[foundKey] : chemicalColors.Default;
}

const ChemicalComposition: React.FC<ChemicalCompositionProps> = ({ composition }) => {
  if (!composition || composition.length === 0) {
    return null;
  }

  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h4 className="text-sm text-gray-400 font-semibold flex items-center mb-3">
        <BeakerIcon className="w-5 h-5 mr-2 text-accent-magenta" />
        Atmospheric Composition
      </h4>
      <div className="space-y-2">
        {composition.map(({ chemical, percentage }) => (
          <div key={chemical}>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-gray-200">{chemical}</span>
              <span className="text-gray-400">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-space-light rounded-full h-2">
              <div
                className={`${getChemicalColor(chemical)} h-2 rounded-full`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChemicalComposition;