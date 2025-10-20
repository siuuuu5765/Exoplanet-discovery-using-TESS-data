// components/PlanetProfileCard.tsx
import React from 'react';
import type { PlanetAnalysis } from '../types';
import { ClockIcon, RulerIcon, StarIcon, SignalIcon } from './Icons';

interface PlanetProfileCardProps {
  planet: PlanetAnalysis['planet'];
  star: PlanetAnalysis['star'];
  detectionSnr: number;
}

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; unit: string; }> = ({ icon, label, value, unit }) => (
    <div>
        <div className="flex items-center text-sm text-gray-400">
            {icon}
            <span className="ml-2">{label}</span>
        </div>
        <p className="text-xl font-bold text-white mt-1">
            {value} <span className="text-base font-normal text-gray-400">{unit}</span>
        </p>
    </div>
);

const PlanetProfileCard: React.FC<PlanetProfileCardProps> = ({ planet, star, detectionSnr }) => {
  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm h-full">
      <h3 className="text-xl font-bold font-display text-accent-cyan mb-4">{planet.name} - Key Properties</h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat 
          icon={<ClockIcon className="w-5 h-5 text-accent-gold" />}
          label="Orbital Period"
          value={planet.period.toFixed(3)}
          unit="days"
        />
        <Stat 
          icon={<RulerIcon className="w-5 h-5 text-accent-gold" />}
          label="Planet Radius"
          value={planet.radius.toFixed(2)}
          unit="x Earth"
        />
        <Stat 
          icon={<StarIcon className="w-5 h-5 text-accent-gold" />}
          label="Host Star Mag."
          value={star.apparentMagnitude.toFixed(2)}
          unit="mag"
        />
        <Stat 
          icon={<SignalIcon className="w-5 h-5 text-accent-gold" />}
          label="Detection SNR"
          value={detectionSnr.toFixed(1)}
          unit=""
        />
      </div>
    </div>
  );
};

export default PlanetProfileCard;
