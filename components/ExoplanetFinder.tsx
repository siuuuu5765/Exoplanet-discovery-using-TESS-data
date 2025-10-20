// components/ExoplanetFinder.tsx
import React, { useState } from 'react';
import { fetchAndAnalyzeTicData } from '../services/geminiService';
import { generateMockAnalysis } from '../services/mockData';
import { exportAnalysisToJSON, exportAnalysisToCSV } from '../services/exportService';
import { generatePdfReport } from '../services/pdfGenerator';
import { generatePresentation } from '../services/presentationPackService';
import type { PlanetAnalysis, BlsParameters } from '../types';
import LightCurveChart from './LightCurveChart';
import PlanetVisualizer from './PlanetVisualizer';
import PlanetProfileCard from './PlanetProfileCard';
import HabitabilityCard from './HabitabilityCard';
import RadialVelocityChart from './RadialVelocityChart';
import MachineLearningClassifier from './MachineLearningClassifier';
import BlsPowerSpectrumChart from './BlsPowerSpectrumChart';
import PhaseFoldedLightCurveChart from './PhaseFoldedLightCurveChart';
import TransitFitParameters from './TransitFitParameters';
import ResearchSummary from './ResearchSummary';
import ComparisonTable from './ComparisonTable';
import DetrendingInfoCard from './DetrendingInfoCard';
import BlsParametersComponent from './BlsParameters';
import PlanetSelector from './PlanetSelector';
import InjectionRecovery from './InjectionRecovery';
import BayesianOptimization from './BayesianOptimization';
import MlPerformanceMetrics from './MlPerformanceMetrics';
import Chatbot from './Chatbot';

// FIX: The main component for finding and displaying exoplanet data.
const ExoplanetFinder: React.FC = () => {
    const [ticId, setTicId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<PlanetAnalysis | null>(null);
    const [blsParams, setBlsParams] = useState<BlsParameters>({
        periodRange: [1, 20],
        depthThreshold: 0.001,
        snrCutoff: 7.0,
    });

    const handleFetchData = async (idToFetch: string) => {
        if (!idToFetch) return;
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            let result: PlanetAnalysis;
            if (idToFetch.toLowerCase() === 'mock') {
                result = generateMockAnalysis();
            } else {
                result = await fetchAndAnalyzeTicData(idToFetch, blsParams);
            }
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectTarget = (selectedTicId: string) => {
        setTicId(selectedTicId);
        handleFetchData(selectedTicId);
    };

    return (
        <div className="container mx-auto">
            <div className="max-w-xl mx-auto bg-space-blue/50 p-4 rounded-lg shadow-lg border border-space-light backdrop-blur-sm">
                <div className="flex">
                    <input
                        type="text"
                        value={ticId}
                        onChange={(e) => setTicId(e.target.value)}
                        placeholder="Enter TESS Input Catalog (TIC) ID..."
                        className="flex-1 bg-space-dark p-3 rounded-l-md border-0 focus:ring-2 focus:ring-accent-magenta outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleFetchData(ticId)}
                        disabled={isLoading}
                        className="bg-accent-magenta text-white font-bold py-3 px-6 rounded-r-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                <BlsParametersComponent params={blsParams} setParams={setBlsParams} disabled={isLoading} />
                <PlanetSelector onSelect={handleSelectTarget} disabled={isLoading} />
            </div>

            {error && <p className="text-center text-red-400 mt-4 animate-fade-in">{error}</p>}
            
            {isLoading && (
                <div className="text-center mt-8">
                    <div className="loader"></div>
                    <p className="text-lg text-accent-cyan mt-4 animate-pulse">Analyzing starlight... this may take a moment.</p>
                </div>
            )}
            
            {analysisResult && (
                <div id="analysis-report" className="mt-8 space-y-8 animate-fade-in">
                    
                    {/* Top Section: Profile & Visualization */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PlanetProfileCard planet={analysisResult.planet} star={analysisResult.star} />
                        <PlanetVisualizer planet={analysisResult.planet} star={analysisResult.star} />
                    </div>

                    {/* Signal Analysis Section */}
                     <div className="p-4 rounded-lg bg-space-blue/30 border border-space-light/50">
                        <h2 className="text-2xl font-display text-accent-gold tracking-wider text-center mb-4">Signal Detection & Analysis</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <LightCurveChart data={analysisResult.lightCurve} period={analysisResult.detection.blsPeriod.value} />
                            <BlsPowerSpectrumChart data={analysisResult.detection.blsPowerSpectrum} bestPeriod={analysisResult.detection.blsPeriod.value} />
                            <PhaseFoldedLightCurveChart data={analysisResult.detection.phaseFoldedLightCurve} modelData={analysisResult.detection.transitFitModel} />
                             <div className="flex flex-col gap-4">
                                <TransitFitParameters params={analysisResult.detection.transitFitParameters}/>
                                <DetrendingInfoCard />
                            </div>
                        </div>
                    </div>

                    {/* Habitability & Classification */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <HabitabilityCard habitability={analysisResult.habitability} atmosphere={analysisResult.atmosphere} />
                       <MachineLearningClassifier result={analysisResult.classification} />
                    </div>

                     {/* Advanced Validation Section */}
                     <div className="p-4 rounded-lg bg-space-blue/30 border border-space-light/50">
                        <h2 className="text-2xl font-display text-accent-gold tracking-wider text-center mb-4">Advanced Validation & Modeling</h2>
                         <div className="space-y-8">
                            <RadialVelocityChart data={analysisResult.radialVelocityCurve} />
                            <InjectionRecovery lightCurve={analysisResult.lightCurve} originalPeriod={analysisResult.detection.blsPeriod.value} originalDepth={analysisResult.detection.transitFitParameters.depth} />
                            <MlPerformanceMetrics />
                            <BayesianOptimization />
                        </div>
                    </div>

                    {/* Research & Comparison */}
                    <ResearchSummary summary={analysisResult.research.summary} abstract={analysisResult.research.abstract} />
                    <ComparisonTable data={analysisResult.comparisonData} />


                    {/* Export Buttons */}
                    <div className="text-center pt-4 space-x-2">
                         <button onClick={() => exportAnalysisToJSON(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Export to JSON</button>
                         <button onClick={() => exportAnalysisToCSV(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Export to CSV</button>
                         <button onClick={() => generatePdfReport(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Generate PDF Report</button>
                         <button onClick={() => generatePresentation(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Generate Presentation</button>
                    </div>

                    <Chatbot />
                </div>
            )}
        </div>
    );
};

export default ExoplanetFinder;
