
// components/PlanetSelector.tsx
import React from 'react';

interface PlanetSelectorProps {
    onSelect: (ticId: string) => void;
    disabled: boolean;
}

const interestingTargets = [
    { name: 'Kepler-186 f', ticId: '233544353', note: 'First Earth-size planet in habitable zone' },
    { name: 'TRAPPIST-1 e', ticId: '200164267', note: 'Potentially habitable, rocky world' },
    { name: 'Proxima Centauri b', ticId: '429375484', note: 'Closest exoplanet to Earth' },
    { name: 'Mock Data', ticId: 'mock', note: 'Generate a random analysis' },
];

// FIX: Provides a list of pre-selected interesting targets for users to explore.
const PlanetSelector: React.FC<PlanetSelectorProps> = ({ onSelect, disabled }) => {
    return (
        <div className="mt-4 text-center">
            <p className="text-sm text-gray-400 mb-2">Or select an interesting target:</p>
            <div className="flex flex-wrap justify-center gap-2">
                {interestingTargets.map(target => (
                    <button
                        key={target.ticId}
                        onClick={() => onSelect(target.ticId)}
                        disabled={disabled}
                        className="bg-space-light/50 hover:bg-space-light text-gray-300 text-xs font-semibold py-1 px-3 border border-space-light rounded-full shadow transition-colors disabled:opacity-50"
                        title={target.note}
                    >
                        {target.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlanetSelector;
