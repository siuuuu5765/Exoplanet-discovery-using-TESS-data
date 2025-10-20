// components/TransitFitParameters.tsx
import React from 'react';
import type { TransitFitParams } from '../types';

interface TransitFitParametersProps {
  params: TransitFitParams;
}

const Stat: React.FC<{ label: string; value: string; description: string }> = ({ label, value, description }) => (
  <div className="bg-space-dark/40 p-3 rounded-md">
    <div className="text-xs text-gray-400" title={description}>{label}</div>
    <div className="text-lg font-bold text-gray-100">{value}</div>
  </div>
);

const TransitFitParameters: React.FC<TransitFitParametersProps> = ({ params }) => {
  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">Transit Model Parameters</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </div>
  );
};

export default TransitFitParameters;
