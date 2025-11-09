// components/PlanetProfileCard.tsx
import React from 'react';
import type { PlanetAnalysis } from '../types';
import DataCard from './DataCard';

interface PlanetProfileCardProps {
  planet: PlanetAnalysis['planet'];
  star: PlanetAnalysis['star'];
}

/**
 * Formats a numerical value for display. If the value is 0, it's
 * considered "not available" and returns 'N/A'.
 * @param value The numerical value.
 * @param unit The unit to append (e.g., 'days', 'K').
 * @param precision The number of decimal places.
 * @returns A formatted string or 'N/A'.
 */
const formatValue = (value: number, unit: string, precision: number = 2): string => {
    if (!value || value === 0) {
        return 'N/A';
    }
    return `${value.toFixed(precision)} ${unit}`;
}


// FIX: This component displays a profile card for the detected planet and its host star.
const PlanetProfileCard: React.FC<PlanetProfileCardProps> = ({ planet, star }) => (
  <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
    <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">System Profile</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Planet Info */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-accent-gold text-center">Planet: {planet.name}</h4>
        <DataCard title="Orbital Period" value={formatValue(planet.period.value, 'days')} />
        <DataCard title="Planet Radius" value={formatValue(planet.radius.value, 'x Earth')} />
        <DataCard title="Planet Mass" value={formatValue(planet.mass.value, 'x Earth')} />
        <DataCard title="Est. Temperature" value={formatValue(planet.temperature, 'K', 0)} />
      </div>
      
      {/* Star Info */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-accent-gold text-center">Star: {star.name}</h4>
        <DataCard title="Star Type" value={star.type} />
        <DataCard title="Apparent Magnitude" value={formatValue(star.apparentMagnitude, '')} />
        <DataCard title="Distance" value={formatValue(star.distance, 'light-years', 0)} />
      </div>
    </div>
  </div>
);

export default PlanetProfileCard;