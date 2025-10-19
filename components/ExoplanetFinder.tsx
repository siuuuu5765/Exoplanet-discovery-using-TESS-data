import React, { useState, useCallback } from 'react';
import { getExoplanetData } from '../services/geminiService';
import type { ExoplanetData } from '../types';
import DataCard from './DataCard';
import LightCurveChart from './LightCurveChart';
import PlanetVisualizer from './PlanetVisualizer';
import ChemicalComposition from './ChemicalComposition';
import HabitabilityCard from './HabitabilityCard';
import RadialVelocityChart from './RadialVelocityChart';
import { LoadingSpinner, StarIcon, TelescopeIcon, ChartBarIcon, WaveformIcon } from './Icons';

type ChartTab = 'transit' | 'radialVelocity';

const ExoplanetFinder: React.FC = () => {
  const [ticId, setTicId] = useState<string>('');
  const [data, setData] = useState<ExoplanetData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ChartTab>('transit');

  const handleSearch = useCallback(async () => {
    if (!ticId) {
      setError('Please enter a TIC ID.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await getExoplanetData(ticId);
      setData(result);
      setActiveTab('transit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [ticId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };
  
  const TabButton: React.FC<{tabName: ChartTab, currentTab: ChartTab, children: React.ReactNode, icon: React.ReactNode}> = ({tabName, currentTab, children, icon}) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center justify-center w-1/2 px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
            currentTab === tabName
            ? 'bg-accent-cyan/20 text-accent-cyan border-b-2 border-accent-cyan'
            : 'text-gray-400 hover:bg-space-light/50'
        }`}
        >
        {icon}
        {children}
    </button>
  );

  const renderResults = () => {
    if (!data) return null;

    return (
      <div className="mt-8 animate-fade-in-up">
        {data.isExoplanetHost ? (
            <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 p-4 rounded-lg text-center mb-6 border border-cyan-400">
              <h2 className="text-2xl font-bold text-accent-cyan drop-shadow-[0_1px_2px_rgba(0,255,255,0.3)]">Confirmed Exoplanet System: {data.planetName}</h2>
            </div>
        ) : (
             <div className="bg-gradient-to-r from-amber-500/20 to-gold-500/20 p-4 rounded-lg text-center mb-6 border border-amber-400">
                <h2 className="text-2xl font-bold text-accent-gold drop-shadow-[0_1px_2px_rgba(255,215,0,0.3)]">Planet Candidate Detected</h2>
                <p className="text-sm text-amber-200">This system is a candidate of interest. Data shown is a plausible simulation.</p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-space-blue/50 p-6 rounded-xl shadow-lg border border-space-light backdrop-blur-sm">
                    <h3 className="text-xl font-bold font-display text-accent-cyan mb-4 flex items-center"><TelescopeIcon className="w-6 h-6 mr-2" /> Mission Data Log</h3>
                    <p className="text-gray-300 leading-relaxed">{data.description}</p>
                </div>
                <div className="bg-space-blue/50 rounded-xl shadow-lg border border-space-light backdrop-blur-sm">
                    <div className="flex border-b border-space-light">
                       <TabButton tabName="transit" currentTab={activeTab} icon={<ChartBarIcon className="w-5 h-5 mr-2" />}>Transit Method</TabButton>
                       <TabButton tabName="radialVelocity" currentTab={activeTab} icon={<WaveformIcon className="w-5 h-5 mr-2" />}>Radial Velocity</TabButton>
                    </div>
                   <div className="p-6">
                     {activeTab === 'transit' ? (
                       <>
                         <h3 className="text-xl font-bold font-display text-accent-cyan mb-4">Transit Light Curve</h3>
                         <LightCurveChart data={data.lightCurveData} />
                       </>
                     ) : (
                       <>
                          <h3 className="text-xl font-bold font-display text-accent-cyan mb-4">Stellar Radial Velocity</h3>
                          <RadialVelocityChart data={data.radialVelocityData} />
                       </>
                     )}
                   </div>
                </div>
            </div>
            <div className="space-y-6">
                <PlanetVisualizer planetName={data.planetName || 'Planet Candidate'} planetRadius={data.planetRadius} starType={data.starType} />
                <HabitabilityCard score={data.habitabilityScore} inZone={data.habitableZone}/>
                <ChemicalComposition composition={data.chemicalComposition} />
                <DataCard title="Orbital Period" value={`${data.orbitalPeriod} days`} />
                <DataCard title="Planet Radius" value={`${data.planetRadius}x Earth`} />
                <DataCard title="Host Star" value={`${data.starName} (${data.starType})`} icon={<StarIcon className="w-5 h-5 mr-2 text-accent-gold"/>} />
                <DataCard title="Distance" value={`${data.distance} light-years`} />
                <DataCard title="Discovery Year" value={data.discoveryDate} />
            </div>
        </div>
      </div>
    );
  };
  
  return (
    <section>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
        <input
          type="text"
          value={ticId}
          onChange={(e) => setTicId(e.target.value)}
          placeholder="Enter TIC ID (e.g., 200052210)"
          className="flex-grow bg-space-blue/80 border-2 border-space-light rounded-md px-4 py-3 text-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex justify-center items-center bg-accent-cyan text-space-dark font-bold text-lg px-8 py-3 rounded-md hover:bg-white disabled:bg-space-light disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isLoading ? <LoadingSpinner /> : 'Analyze'}
        </button>
      </form>

      {error && <p className="text-center text-red-400 mt-4">{error}</p>}

      {isLoading && (
        <div className="text-center mt-8">
            <LoadingSpinner className="w-12 h-12 inline-block"/>
            <p className="mt-2 text-lg text-accent-cyan animate-pulse">Analyzing stellar photometry... Accessing TESS database...</p>
        </div>
      )}
      
      {!isLoading && !data && (
        <div className="text-center mt-12 text-space-light max-w-2xl mx-auto">
            <TelescopeIcon className="w-24 h-24 mx-auto opacity-30"/>
            <h3 className="text-2xl font-display mt-4">Awaiting Target Coordinates</h3>
            <p className="mt-2">The cosmos is vast and full of wonders. Enter a TESS ID to begin your exploration and uncover the secrets hidden in the stars.</p>
        </div>
      )}

      {renderResults()}
    </section>
  );
};

export default ExoplanetFinder;
