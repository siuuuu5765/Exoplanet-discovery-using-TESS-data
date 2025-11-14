// components/FeaturedSystems.tsx
import React from 'react';

interface FeaturedSystemsProps {
    onSelect: (ticId: string) => void;
    disabled: boolean;
}

const interestingTargets = [
    { name: 'Kepler-186 f', ticId: '233544353', note: 'First Earth-size planet in the habitable zone.' },
    { name: 'TRAPPIST-1 e', ticId: '200164267', note: 'One of seven rocky worlds in a compact system.' },
    { name: 'Proxima Centauri b', ticId: '429375484', note: 'The closest exoplanet to our solar system.' },
    { name: 'Kepler-16 b', ticId: '270984389', note: 'A real-life "Tatooine" orbiting two suns.' },
];

const cardImages: { [key: string]: string } = {
    '233544353': 'https://storage.googleapis.com/aistudio-public-images-testing/codelab-tess/earth-like.png',
    '200164267': 'https://storage.googleapis.com/aistudio-public-images-testing/codelab-tess/trappist.png',
    '429375484': 'https://storage.googleapis.com/aistudio-public-images-testing/codelab-tess/proxima.png',
    '270984389': 'https://storage.googleapis.com/aistudio-public-images-testing/codelab-tess/tatooine.png',
};

const FeaturedSystemCard: React.FC<{ target: typeof interestingTargets[0], onSelect: (id: string) => void, disabled: boolean }> = ({ target, onSelect, disabled }) => (
    <div 
        className={`bg-space-blue/60 rounded-lg shadow-lg border border-space-light/50 overflow-hidden 
                    transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onSelect(target.ticId)}
        aria-disabled={disabled}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyPress={(e) => { if (e.key === 'Enter' && !disabled) onSelect(target.ticId); }}
    >
        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${cardImages[target.ticId]})` }}></div>
        <div className="p-4">
            <h4 className="font-bold text-lg text-accent-cyan group-hover:text-accent-gold transition-colors">{target.name}</h4>
            <p className="text-sm text-gray-300 mt-1 h-10">{target.note}</p>
        </div>
    </div>
);


const FeaturedSystems: React.FC<FeaturedSystemsProps> = ({ onSelect, disabled }) => {
    return (
        <div className="mt-12 animate-fade-in">
            <h2 className="text-2xl font-display text-center text-gray-300 mb-6">
                Or explore a featured system
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {interestingTargets.map(target => (
                    <FeaturedSystemCard key={target.ticId} target={target} onSelect={onSelect} disabled={disabled} />
                ))}
            </div>
        </div>
    );
};

export default FeaturedSystems;
