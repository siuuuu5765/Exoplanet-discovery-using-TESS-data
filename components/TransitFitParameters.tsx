// components/TransitFitParameters.tsx
import React from 'react';
import type { TransitFitParams } from '../types';

interface TransitFitParametersProps {
  params: TransitFitParams & { period: number };
  onPeriodChange: (newPeriod: number) => void;
}

const Stat: React.FC<{ label: string; value: string; description: string }> = ({ label, value, description }) => (
  <div className="bg-space-dark/40 p-3 rounded-md flex flex-col justify-center">
    <div className="text-xs text-gray-400" title={description}>{label}</div>
    <div className="text-lg font-bold text-gray-100">{value}</div>
  </div>
);

const EditableStat: React.FC<{ label: string; value: number | undefined; onChange: (newValue: number) => void; description: string }> = ({ label, value, onChange, description }) => (
    <div className="bg-space-dark/40 p-3 rounded-md flex flex-col justify-center">
        <label htmlFor={`stat-${label}`} className="text-xs text-gray-400" title={description}>{label}</label>
        <input
            id={`stat-${label}`}
            type="number"
            value={value !== undefined ? value.toFixed(4) : ''}
            onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                    onChange(val);
                }
            }}
            // Hides browser default arrows for number inputs for a cleaner look
            className="text-lg font-bold text-gray-100 bg-transparent w-full outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            step="0.0001"
        />
    </div>
);

const TransitFitParameters: React.FC<TransitFitParametersProps> = ({ params, onPeriodChange }) => {
  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">Transit Model Parameters</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <EditableStat 
            label="Orbital Period (d)"
            value={params.period}
            onChange={onPeriodChange}
            description="The time it takes for the planet to complete one orbit. Change this to refold the light curve."
        />
        <Stat 
            label="Transit Depth" 
            value={`${(params.depth * 100).toFixed(3)}%`} 
            description="The percentage of starlight blocked by the planet."
        />
        <Stat 
            label="Transit Duration" 
            value={`${params.duration.toFixed(2)} hours`} 
            description="The time it takes for the planet to cross the star's disk."
        />
        <Stat 
            label="Impact Parameter (b)" 
            value={params.impactParameter.toFixed(3)} 
            description="How close the planet's path is to the center of the star (0=center, 1=grazing)."
        />
        <Stat 
            label="Epoch (BJD)" 
            value={params.epoch.toFixed(4)} 
            description="The timestamp of the center of the first observed transit."
        />
      </div>
      <p className="text-xs text-gray-400 text-center mt-3">Adjust the Orbital Period to dynamically refold the light curve chart.</p>
    </div>
  );
};

export default TransitFitParameters;