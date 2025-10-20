
// components/PlanetVisualizer.tsx
import React from 'react';
import type { PlanetAnalysis } from '../types';

interface PlanetVisualizerProps {
  planet: PlanetAnalysis['planet'];
  star: PlanetAnalysis['star'];
}

// FIX: A simple CSS-based visualizer for the exoplanet and its star.
const PlanetVisualizer: React.FC<PlanetVisualizerProps> = ({ planet, star }) => {
  const planetSize = Math.max(10, Math.min(planet.radius.value * 5, 50)); // Scale radius
  const orbitSize = 100 + Math.log(planet.period.value) * 20; // Scale period

  // Basic color mapping based on temperature
  const getPlanetColor = (temp: number) => {
    if (temp < 200) return 'from-blue-400 to-blue-800'; // Icy
    if (temp < 350) return 'from-green-400 to-blue-500'; // Earth-like
    if (temp < 600) return 'from-yellow-400 to-orange-600'; // Hot
    return 'from-red-500 to-red-800'; // Very hot
  };

  const planetColor = getPlanetColor(planet.temperature);

  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm h-full flex flex-col justify-center items-center overflow-hidden">
        <h3 className="text-sm text-gray-400 font-semibold mb-4">System Visualization</h3>
        <div className="relative w-64 h-64 flex justify-center items-center">
            {/* Orbit Path */}
            <div 
                className="absolute border-2 border-dashed border-accent-gold/50 rounded-full"
                style={{ width: `${orbitSize * 2}px`, height: `${orbitSize * 2}px` }}
            ></div>

            {/* Star */}
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
            
            {/* Planet and Orbit Animation */}
            <div 
                className="absolute"
                style={{
                    width: `${orbitSize * 2}px`,
                    height: `${orbitSize * 2}px`,
                    animation: `orbit ${planet.period.value * 2}s linear infinite`
                }}
            >
                <div 
                    className={`absolute bg-gradient-to-br ${planetColor} rounded-full shadow-md`}
                    style={{
                        width: `${planetSize}px`,
                        height: `${planetSize}px`,
                        top: '50%',
                        left: '0%',
                        transform: `translate(-${planetSize / 2}px, -${planetSize / 2}px)`
                    }}
                ></div>
            </div>
        </div>
    </div>
  );
};

export default PlanetVisualizer;
