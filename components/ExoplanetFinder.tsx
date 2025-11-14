// components/ExoplanetFinder.tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { FullAnalysis, BatchResult } from '../types';
import { getSystemProfile } from '../services/systemProfileService';
import { generateMockVisuals } from '../services/mockData';
import { generateAiAnalysis, generateResearchSummary, getChatbotResponse, generateHabitabilityAnalysis, generateAtmosphericComposition } from '../services/geminiService';

// Import all necessary components
import FeaturedSystems from './FeaturedSystems';
import PlanetProfileCard from './PlanetProfileCard';
import PlanetVisualizer from './PlanetVisualizer';
import LightCurveChart from './LightCurveChart';
import PhaseFoldedLightCurveChart from './PhaseFoldedLightCurveChart';
import RadialVelocityChart from './RadialVelocityChart';
import BatchAnalysis from './BatchAnalysis';
import BatchResultsTable from './BatchResultsTable';
import BlsParameters from './BlsParameters';
import BlsPowerSpectrumChart from './BlsPowerSpectrumChart';
import HabitabilityCard from './HabitabilityCard';
import AtmosphericCompositionCard from './ChemicalComposition';
import ComparisonTable from './ComparisonTable';
import ResearchSummary from './ResearchSummary';
import Chatbot from './Chatbot';


const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
            active
                ? 'bg-space-blue/50 border-b-2 border-accent-cyan text-accent-cyan'
                : 'text-gray-400 hover:text-white hover:bg-space-light/30'
        }`}
    >
        {children}
    </button>
);


const ExoplanetFinder: React.FC = () => {
    const [ticId, setTicId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<FullAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
    const [batchProgress, setBatchProgress] = useState('');
    const [blsParams, setBlsParams] = useState({
        periodRange: [0.5, 30],
        snr: 5,
        transitDepth: 100,
    });

    const handleAnalyze = async (idToAnalyze: string) => {
        if (!idToAnalyze) return;
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setBatchResults([]);
        
        try {
            setLoadingMessage('Retrieving Data from Astronomical Archives...');
            const profile = await getSystemProfile(idToAnalyze);
            
            if (profile.Star.Name === 'INVALID TIC ID') {
              setError(`The specified ID (${idToAnalyze}) was not found in astronomical catalogs.`);
              setIsLoading(false);
              return;
            }
            
            setLoadingMessage('Generating Visualizations...');
            const visuals = generateMockVisuals(profile);

            setLoadingMessage('Running Foundational AI Analysis...');
            const { aiAnalysis, comparisonData } = await generateAiAnalysis(profile, blsParams);

            setLoadingMessage('Proposing Follow-up Research...');
            const researchSummary = await generateResearchSummary(profile);

            setLoadingMessage('Assessing Habitability...');
            const habitabilityAnalysis = await generateHabitabilityAnalysis(profile);

            setLoadingMessage('Predicting Atmospheric Composition...');
            const atmosphericComposition = await generateAtmosphericComposition(profile);
            
            const finalResult: FullAnalysis = {
                profile,
                ...visuals,
                aiAnalysis,
                researchSummary,
                comparisonData,
                habitabilityAnalysis,
                atmosphericComposition,
            };
            setAnalysisResult(finalResult);
            setActiveTab('overview');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleRunBatch = async (ticIdsInput: string) => {
        const ids = ticIdsInput.split(/[\s,]+/).filter(id => id.trim() !== '');
        if (ids.length === 0) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setBatchResults([]);
        let currentResults: BatchResult[] = [];

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            setBatchProgress(`(${i + 1}/${ids.length})`);
            try {
                const profile = await getSystemProfile(id);
                if (profile.Star.Name === 'INVALID TIC ID') throw new Error("Invalid TIC ID");
                
                currentResults.push({
                    ticId: id,
                    status: 'success',
                    profile: profile
                });
            } catch (error) {
                currentResults.push({ ticId: id, status: 'failure' });
            }
            setBatchResults([...currentResults]);
        }
        setBatchProgress('');
        setIsLoading(false);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') handleAnalyze(ticId);
    };

    const handleSelectTarget = (selectedTicId: string) => {
        setTicId(selectedTicId);
        handleAnalyze(selectedTicId);
    };

    return (
        <div className="container mx-auto">
            {/* Input Section */}
            <div className="max-w-xl mx-auto bg-space-blue/50 p-4 rounded-lg shadow-lg border border-space-light backdrop-blur-sm">
                <div className="flex">
                    <input
                        type="text"
                        value={ticId}
                        onChange={(e) => setTicId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a TESS Input Catalog (TIC) ID"
                        className="flex-1 bg-space-dark p-3 rounded-l-md border-0 focus:ring-2 focus:ring-accent-magenta outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleAnalyze(ticId)}
                        disabled={isLoading || !ticId.trim()}
                        className="bg-accent-magenta text-white font-bold py-3 px-6 rounded-r-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>

            {error && <div className="text-center text-red-400 mt-4 animate-fade-in max-w-xl mx-auto bg-red-900/50 p-3 rounded-lg border border-red-400"><strong>Error:</strong> {error}</div>}
            
            <BlsParameters params={blsParams} onParamsChange={setBlsParams} disabled={isLoading} />
            <BatchAnalysis onRunBatch={handleRunBatch} disabled={isLoading} progress={batchProgress} />
            <BatchResultsTable results={batchResults} />

            {isLoading && !batchResults.length && (
                <div className="text-center mt-8 animate-fade-in">
                    <div className="loader mx-auto"></div>
                    <p className="text-lg text-accent-cyan mt-4 animate-pulse">{loadingMessage || 'Analyzing...'}</p>
                    <p className="text-sm text-gray-400 mt-2">This may take a few moments.</p>
                </div>
            )}

            {!isLoading && !analysisResult && batchResults.length === 0 && (
                <FeaturedSystems onSelect={handleSelectTarget} disabled={isLoading} />
            )}

            {analysisResult && (
                <div id="analysis-report" className="mt-8 space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PlanetProfileCard profile={analysisResult.profile} />
                        <PlanetVisualizer profile={analysisResult.profile} />
                    </div>
                    
                    <div className="border-b border-space-light/50 flex space-x-2">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Data Visualization</TabButton>
                        <TabButton active={activeTab === 'ai_insights'} onClick={() => setActiveTab('ai_insights')}>AI Insights</TabButton>
                        <TabButton active={activeTab === 'research'} onClick={() => setActiveTab('research')}>Research</TabButton>
                        <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>Chat</TabButton>
                    </div>

                    <div className="bg-space-blue/30 p-4 rounded-b-lg border border-t-0 border-space-light/50">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <LightCurveChart data={analysisResult.lightCurve} period={analysisResult.blsPeriod} epoch={analysisResult.transitEpoch} duration={analysisResult.transitDuration} />
                                <PhaseFoldedLightCurveChart data={analysisResult.phaseFoldedLightCurve} modelData={analysisResult.transitFitModel} />
                                <BlsPowerSpectrumChart data={analysisResult.blsPowerSpectrum} detectedPeriod={analysisResult.blsPeriod} />
                                <RadialVelocityChart data={analysisResult.radialVelocityCurve} />
                            </div>
                        )}
                         {activeTab === 'ai_insights' && (
                            <div className="animate-fade-in space-y-8">
                                {/* Top section: Main Analysis + Habitability */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 prose prose-invert max-w-none bg-space-dark/30 p-4 rounded-md">
                                        <ReactMarkdown>{analysisResult.aiAnalysis}</ReactMarkdown>
                                    </div>
                                    <div className="space-y-6">
                                        <HabitabilityCard analysis={analysisResult.habitabilityAnalysis} />
                                    </div>
                                </div>
                                
                                {/* A new grid for the two new sections, side-by-side */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ComparisonTable data={analysisResult.comparisonData} />
                                    <AtmosphericCompositionCard composition={analysisResult.atmosphericComposition} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'research' && (
                             <ResearchSummary summary={analysisResult.researchSummary} />
                        )}
                         {activeTab === 'chat' && (
                            <Chatbot profile={analysisResult.profile} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExoplanetFinder;