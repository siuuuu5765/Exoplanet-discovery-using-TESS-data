// components/PlanetProfileCard.tsx
import React from 'react';
import type { PlanetAnalysis } from '../types';
import DataCard from './DataCard';

interface PlanetProfileCardProps {
  planet: PlanetAnalysis['planet'];
  star: PlanetAnalysis['star'];
}

// FIX: This component displays a profile card for the detected planet and its host star.
const PlanetProfileCard: React.FC<PlanetProfileCardProps> = ({ planet, star }) => (
  <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
    <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">System Profile</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Planet Info */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-accent-gold text-center">Planet: {planet.name}</h4>
        <DataCard title="Orbital Period" value={`${planet.period.value.toFixed(2)} days`} />
        <DataCard title="Planet Radius" value={`${planet.radius.value.toFixed(2)} x Earth`} />
        <DataCard title="Planet Mass" value={`${planet.mass.value.toFixed(2)} x Earth`} />
        <DataCard title="Est. Temperature" value={`${planet.temperature} K`} />
      </div>
      
      {/* Star Info */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-accent-gold text-center">Star: {star.name}</h4>
        <DataCard title="Star Type" value={star.type} />
        <DataCard title="Apparent Magnitude" value={star.apparentMagnitude.toFixed(2)} />
        <DataCard title="Distance" value={`${star.distance.toFixed(0)} light-years`} />
      </div>
    </div>
  </div>
);

export default PlanetProfileCard;
