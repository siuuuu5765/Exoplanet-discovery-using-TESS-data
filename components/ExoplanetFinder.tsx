// components/ExoplanetFinder.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { FullAnalysis, BatchResult } from '../types';
import { getSystemProfile } from '../services/systemProfileService';
import { generateMockVisuals } from '../services/mockData';
import { generateAiAnalysis, generateResearchSummary, getChatbotResponse, generateHabitabilityAnalysis, generateAtmosphericComposition } from '../services/geminiService';
import { generatePdfReport } from '../services/reportGenerator';

// Import all necessary components
import FeaturedSystems from './FeaturedSystems';
import PlanetProfileCard from './PlanetProfileCard';
import PlanetVisualizer from './PlanetVisualizer';
import LightCurveChart from './LightCurveChart';
import PhaseFoldedLightCurveChart from './PhaseFoldedLightCurveChart';
import BatchAnalysis from './BatchAnalysis';
import BatchResultsTable from './BatchResultsTable';
import BlsParameters from './BlsParameters';
import BlsPowerSpectrumChart from './BlsPowerSpectrumChart';
import HabitabilityAnalysisCard from './HabitabilityAnalysisCard';
import AtmosphericCompositionCard from './ChemicalComposition';
import ComparisonTable from './ComparisonTable';
import ResearchSummary from './ResearchSummary';
import Chatbot from './Chatbot';
import { DownloadIcon } from './Icons';

// Add type declarations for the aistudio window object
// FIX: Define a named interface for aistudio and use it in the global declaration to avoid type conflicts.
// FIX: Moved the AIStudio interface inside the `declare global` block to correctly augment the global Window type from within a module file.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

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
    const [isDownloading, setIsDownloading] = useState(false);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [blsParams, setBlsParams] = useState<{
        periodRange: [number, number];
        snr: number;
        transitDepth: number;
    }>({
        periodRange: [0.5, 30],
        snr: 5,
        transitDepth: 100,
    });

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeyReady(hasKey);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            try {
                await window.aistudio.openSelectKey();
                // Assume success to avoid race conditions and re-enable UI
                setApiKeyReady(true);
                setError(null); // Clear previous errors
            } catch (error) {
                console.error("Error opening API key selection:", error);
                setError("Could not open the API key selection dialog.");
            }
        }
    };


    const handleAnalyze = async (idToAnalyze: string) => {
        if (!idToAnalyze) return;
        
        if (!apiKeyReady) {
            setError("Please select a Gemini API Key before running an analysis.");
            return;
        }

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

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
            if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('permission denied')) {
                setError('There was an issue with your API Key. Please select a valid key and try again.');
                setApiKeyReady(false);
            } else {
                setError(errorMessage);
            }
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
    
    const handleDownloadReport = async () => {
        if (!analysisResult) return;
        setIsDownloading(true);
        try {
            // Give the UI a moment to update button text before blocking the thread
            await new Promise(resolve => setTimeout(resolve, 50)); 
            await generatePdfReport(analysisResult.profile.TIC_ID);
        } catch (error) {
            console.error("Failed to download report", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="container mx-auto">
             {!apiKeyReady && (
                <div className="max-w-xl mx-auto my-4 bg-yellow-900/50 p-4 rounded-lg shadow-lg border border-yellow-400 text-center animate-fade-in">
                    <h3 className="text-lg font-bold text-accent-gold">API Key Required</h3>
                    <p className="text-yellow-200 my-2">To use the AI-powered features of this application, you need to select a Gemini API key.</p>
                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-cyan hover:underline mb-3 block">Learn about billing</a>
                    <button
                        onClick={handleSelectApiKey}
                        className="bg-accent-gold text-space-dark font-bold py-2 px-6 rounded-md hover:bg-accent-gold/80 transition-colors"
                    >
                        Select API Key
                    </button>
                </div>
            )}

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
                        disabled={isLoading || !apiKeyReady}
                    />
                    <button
                        onClick={() => handleAnalyze(ticId)}
                        disabled={isLoading || !ticId.trim() || !apiKeyReady}
                        className="bg-accent-magenta text-white font-bold py-3 px-6 rounded-r-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>

            {error && <div className="text-center text-red-400 mt-4 animate-fade-in max-w-xl mx-auto bg-red-900/50 p-3 rounded-lg border border-red-400"><strong>Error:</strong> {error}</div>}
            
            <BlsParameters params={blsParams} onParamsChange={setBlsParams} disabled={isLoading || !apiKeyReady} />
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
                <FeaturedSystems onSelect={handleSelectTarget} disabled={isLoading || !apiKeyReady} />
            )}

            {analysisResult && (
                <div id="analysis-report" className="mt-8 space-y-8 animate-fade-in">
                    <div id="profile-section" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PlanetProfileCard profile={analysisResult.profile} />
                        <PlanetVisualizer profile={analysisResult.profile} />
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-space-light/50">
                        <div className="flex space-x-2">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Data Visualization</TabButton>
                            <TabButton active={activeTab === 'ai_insights'} onClick={() => setActiveTab('ai_insights')}>AI Insights</TabButton>
                            <TabButton active={activeTab === 'research'} onClick={() => setActiveTab('research')}>Research</TabButton>
                            <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>Chat</TabButton>
                        </div>
                        <button
                            onClick={handleDownloadReport}
                            disabled={isDownloading}
                            className="flex items-center px-4 py-2 mb-[-2px] text-sm font-semibold rounded-t-lg transition-colors focus:outline-none bg-accent-gold/80 text-space-dark hover:bg-accent-gold disabled:opacity-50"
                        >
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            {isDownloading ? 'Downloading...' : 'Download Report'}
                        </button>
                    </div>

                    <div id="tab-content-section" className="bg-space-blue/30 p-4 rounded-b-lg border border-t-0 border-space-light/50">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <LightCurveChart data={analysisResult.lightCurve} period={analysisResult.blsPeriod} epoch={analysisResult.transitEpoch} duration={analysisResult.transitDuration} />
                                <PhaseFoldedLightCurveChart data={analysisResult.phaseFoldedLightCurve} modelData={analysisResult.transitFitModel} />
                                <BlsPowerSpectrumChart data={analysisResult.blsPowerSpectrum} detectedPeriod={analysisResult.blsPeriod} />
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
                                        <HabitabilityAnalysisCard analysis={analysisResult.habitabilityAnalysis} />
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