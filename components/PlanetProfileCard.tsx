// components/PlanetProfileCard.tsx
import React from 'react';
import type { VerifiedSystemProfile } from '../types';

interface PlanetProfileCardProps {
  profile: VerifiedSystemProfile;
  error?: string | null;
}

const StatItem: React.FC<{ label: string; value: string | number; unit?: string; source?: string }> = ({ label, value, unit, source }) => {
    const displayValue = (val: any): string => {
        if (val === 'Not Available') return val;
        if (typeof val === 'number') {
            if (Math.abs(val) < 0.01 && Math.abs(val) > 0) return val.toExponential(2);
            if (Math.abs(val) > 1000) return val.toFixed(0);
            return val.toFixed(3);
        }
        return String(val);
    };

    return (
        <div title={source ? `Source: ${source}` : ''}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-base font-bold text-gray-100">
                {displayValue(value)}
                {value !== 'Not Available' && unit ? <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span> : ''}
            </p>
        </div>
    );
};

const getTemperatureColor = (temp: number | 'Not Available'): string => {
    if (temp === 'Not Available') return 'text-gray-400';
    if (temp < 3500) return 'text-orange-400'; // M-type
    if (temp < 5000) return 'text-yellow-300'; // K-type
    if (temp < 6000) return 'text-white'; // G-type
    if (temp < 7500) return 'text-yellow-50'; // F-type
    return 'text-sky-300'; // A-type and hotter
};

const PlanetProfileCard: React.FC<PlanetProfileCardProps> = ({ profile, error }) => {
    if (error) {
        return (
            <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm flex flex-col justify-center items-center h-full">
                <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">🌟 System Profile</h3>
                <p className="text-center text-red-400">{error}</p>
            </div>
        );
    }
    
    const { Star, Planet, Source } = profile;
    
    return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
        <h3 className="text-lg font-bold font-display text-accent-cyan mb-4">🌟 System Profile</h3>

        <div className="space-y-4">
            {/* Star Info */}
            <div>
                <h4 className={`text-xl font-semibold text-center mb-2 ${getTemperatureColor(Star.Temperature_K)}`}>
                    Star: {Star.Name}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                    <StatItem label="Distance" value={Star.Distance_ly} unit="light-years" source={Source.Distance} />
                    <StatItem label="Apparent Magnitude" value={Star.Apparent_Magnitude} unit="mag" />
                    <StatItem label="Temperature" value={Star.Temperature_K} unit="K" source={Source.Other_Stellar_Params}/>
                    <StatItem label="Radius" value={Star.Radius_Rsun} unit="R☉" source={Source.Other_Stellar_Params}/>
                    <StatItem label="Mass" value={Star.Mass_Msun} unit="M☉" source={Source.Other_Stellar_Params}/>
                    <StatItem label="Luminosity" value={Star.Luminosity_Lsun} unit="L☉" source={Source.Other_Stellar_Params}/>
                    <StatItem label="Surface Gravity" value={Star.Surface_Gravity_logg} unit="log(g)" source={Source.Other_Stellar_Params}/>
                    <StatItem label="Metallicity" value={Star.Metallicity_FeH} unit="[Fe/H]" source={Source.Other_Stellar_Params}/>
                    <StatItem label="Coordinates" value={Star.Coordinates.RA_deg !== 'Not Available' && Star.Coordinates.Dec_deg !== 'Not Available' ? `${Star.Coordinates.RA_deg.toFixed(3)}°, ${Star.Coordinates.Dec_deg.toFixed(3)}°` : 'Not Available'} unit="RA, Dec" />
                </div>
            </div>

            <div className="border-t border-space-light/50 my-2"></div>

            {/* Planet Info */}
            <div>
                <h4 className="text-xl font-semibold text-accent-gold text-center mb-2">Planet Candidate: {Planet.Name}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                    <StatItem label="Orbital Period" value={Planet.Orbital_Period_days} unit="days" source={Source.Planet_Params}/>
                    <StatItem label="Planet Radius" value={Planet.Planet_Radius_Rearth} unit="R⊕" source={Source.Planet_Params}/>
                    <StatItem label="Planet Mass" value={Planet.Planet_Mass_Mearth} unit="M⊕" source={Source.Planet_Params}/>
                    <StatItem label="Est. Temperature" value={Planet.Equilibrium_Temperature_K} unit="K" source={Source.Planet_Params}/>
                </div>
            </div>
        </div>
    </div>
    );
};

export default PlanetProfileCard;
