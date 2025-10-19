import React from 'react';

interface PlanetVisualizerProps {
  planetName: string;
  planetRadius: number;
  starType: string;
}

const getStarProperties = (starType: string) => {
    const type = starType.charAt(0).toUpperCase();
    switch(type) {
        case 'M': return { color: 'bg-red-500', size: 'w-24 h-24' };
        case 'K': return { color: 'bg-orange-400', size: 'w-28 h-28' };
        case 'G': return { color: 'bg-yellow-300', size: 'w-32 h-32' };
        case 'F': return { color: 'bg-yellow-100', size: 'w-36 h-36' };
        case 'A': return { color: 'bg-blue-200', size: 'w-40 h-40' };
        case 'B': return { color: 'bg-blue-400', size: 'w-44 h-44' };
        case 'O': return { color: 'bg-blue-600', size: 'w-48 h-48' };
        default: return { color: 'bg-yellow-300', size: 'w-32 h-32' };
    }
}

const PlanetVisualizer: React.FC<PlanetVisualizerProps> = ({ planetName, planetRadius, starType }) => {
  const star = getStarProperties(starType);
  // Clamp planet size for better visualization
  const planetSize = Math.max(8, Math.min(24, 4 * planetRadius)); 
  const orbitSize = 200 + planetSize; // Adjust orbit size based on planet

  return (
    <div className="bg-space-blue/50 p-6 rounded-xl shadow-lg border border-space-light backdrop-blur-sm text-center">
      <h3 className="text-xl font-bold font-display text-accent-cyan mb-4">System Visualizer</h3>
      <div className="flex justify-center items-center my-4 h-48">
        <div
            className="relative flex justify-center items-center"
            style={{ width: `${orbitSize}px`, height: `${orbitSize}px` }}
        >
            {/* Star */}
            <div className={`${star.color} rounded-full absolute shadow-2xl shadow-accent-gold/30`} 
                 style={{ width: star.size, height: star.size, animation: 'pulse 3s infinite ease-in-out' }}>
            </div>

             {/* Orbit Path */}
             <div className="absolute border-2 border-dashed border-space-light/50 rounded-full"
                 style={{ width: `${orbitSize}px`, height: `${orbitSize}px` }}>
            </div>

            {/* Planet Container for Orbit Animation */}
            <div
                className="absolute w-full h-full"
                style={{ animation: `spin 15s linear infinite` }}
            >
                {/* Planet */}
                <div
                    className="absolute bg-slate-400 rounded-full shadow-lg border-2 border-slate-200"
                    style={{
                        width: `${planetSize}px`,
                        height: `${planetSize}px`,
                        top: '50%',
                        left: '0',
                        transform: 'translate(-50%, -50%)',
                    }}
                ></div>
            </div>
        </div>
      </div>
      <p className="text-lg font-bold text-white mt-4">{planetName}</p>
      <style>{`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px 5px rgba(255, 215, 0, 0.2); }
            50% { transform: scale(1.05); box-shadow: 0 0 35px 10px rgba(255, 215, 0, 0.4); }
        }
      `}</style>
    </div>
  );
};

export default PlanetVisualizer;
