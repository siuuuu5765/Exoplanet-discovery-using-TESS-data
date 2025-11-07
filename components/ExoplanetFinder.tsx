// components/ExoplanetFinder.tsx
import React, { useState } from 'react';
import { fetchAndAnalyzeTicData, analyzeTicIdForBatch } from '../services/geminiService';
import { generateMockAnalysis } from '../services/mockData';
import { exportAnalysisToJSON, exportAnalysisToCSV } from '../services/exportService';
import { generatePdfReport } from '../services/pdfGenerator';
import { generatePresentation } from '../services/presentationPackService';
import { generateResearchReport } from '../services/reportGenerator';
import type { PlanetAnalysis, BlsParameters, BatchResult } from '../types';
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
import TransitDetailChart from './TransitDetailChart'; // Import the new component
import BatchAnalysis from './BatchAnalysis';
import BatchResultsTable from './BatchResultsTable';
import ResearchReportModal from './ResearchReportModal';

// This component is now self-reliant for API calls and doesn't need to signal parent components.
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
    const [isBatchRunning, setIsBatchRunning] = useState(false);
    const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
    const [batchProgress, setBatchProgress] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportMarkdown, setReportMarkdown] = useState('');


    const handleApiError = (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';

        // Provide more user-friendly messages for common API errors.
        if (errorMessage.includes("API key") || errorMessage.includes("Requested entity was not found") || errorMessage.includes("invalid authentication credentials")) {
            setError("Authentication Failed: The provided API key is invalid, missing, or not enabled for this project. Please verify your Vercel environment variable.");
        } else if (errorMessage.includes("Content has been blocked")) {
            setError("Analysis Blocked: The AI's safety settings blocked the request or response. This can sometimes occur with complex data. Please try a different target.");
        } else if (errorMessage.includes("quota")) {
            setError("Quota Exceeded: You have exceeded your usage limits for the Gemini API. Please check your Google Cloud account for details.");
        } else if (errorMessage.includes("location is not supported")) {
            setError("Service Unavailable: The Gemini API is not available in your current location.");
        } else if (errorMessage.includes("unexpected format")) {
             // Handle our custom parsing error
             setError("Data Parsing Error: The AI model returned data in an unexpected format. This may be a temporary issue. Please try again.");
        }
        else {
            // For any other errors, display the raw message for debugging.
            setError(`An unexpected error occurred: ${errorMessage}`);
        }
    };

    const handleFetchData = async (idToFetch: string) => {
        if (!idToFetch) return;
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setBatchResults([]);

        try {
            let result: PlanetAnalysis;
            if (idToFetch.toLowerCase() === 'mock') {
                result = generateMockAnalysis();
            } else {
                result = await fetchAndAnalyzeTicData(idToFetch, blsParams);
            }
            setAnalysisResult(result);
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectTarget = (selectedTicId: string) => {
        setTicId(selectedTicId);
        handleFetchData(selectedTicId);
    };

    const handleRunBatch = async (ticIdsInput: string) => {
        const ticIds = ticIdsInput.trim().split(/\s+/).filter(id => id);
        if (ticIds.length === 0) return;

        setIsBatchRunning(true);
        setBatchResults([]);
        setBatchProgress('');
        setError(null);
        setAnalysisResult(null);

        const results: BatchResult[] = [];

        for (let i = 0; i < ticIds.length; i++) {
            const currentTicId = ticIds[i];
            setBatchProgress(`Analyzing ${i + 1} of ${ticIds.length}: ${currentTicId}`);
            try {
                if (currentTicId.toLowerCase() === 'mock') {
                    // Create a mock batch result
                    const mockAnalysis = generateMockAnalysis(currentTicId);
                    results.push({
                        ticId: currentTicId,
                        status: 'success',
                        detection: mockAnalysis.detection,
                        classification: mockAnalysis.classification,
                        planet: mockAnalysis.planet,
                    });
                } else {
                    const result = await analyzeTicIdForBatch(currentTicId, blsParams);
                    results.push({
                        ticId: currentTicId,
                        status: 'success',
                        detection: result.detection,
                        classification: result.classification,
                        planet: result.planet,
                    });
                }
            } catch (err) {
                console.error(`Error processing TIC ID ${currentTicId} in batch:`, err);
                results.push({ ticId: currentTicId, status: 'error' });
                handleApiError(err);
                // Stop the batch if there's an API key error
                if (err instanceof Error && err.message.includes("Requested entity was not found")) {
                    break;
                }
            } finally {
                setBatchResults([...results]);
            }
        }

        setBatchProgress('Batch complete!');
        setIsBatchRunning(false);
    };

    const handleGenerateReport = () => {
        if (!analysisResult) return;
        const markdown = generateResearchReport(analysisResult);
        setReportMarkdown(markdown);
        setIsReportModalOpen(true);
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
                        disabled={isLoading || isBatchRunning}
                    />
                    <button
                        onClick={() => handleFetchData(ticId)}
                        disabled={isLoading || isBatchRunning}
                        className="bg-accent-magenta text-white font-bold py-3 px-6 rounded-r-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : isBatchRunning ? 'Batch Running...' : 'Analyze'}
                    </button>
                </div>
                <BlsParametersComponent params={blsParams} setParams={setBlsParams} disabled={isLoading || isBatchRunning} />
                <PlanetSelector onSelect={handleSelectTarget} disabled={isLoading || isBatchRunning} />
            </div>

            <BatchAnalysis 
                onRunBatch={handleRunBatch}
                disabled={isLoading || isBatchRunning}
                progress={batchProgress}
            />
            <BatchResultsTable results={batchResults} />


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
                         <div className="space-y-8">
                            {analysisResult.lightCurve && analysisResult.lightCurve.length > 0 && (
                                <LightCurveChart 
                                    data={analysisResult.lightCurve} 
                                    period={analysisResult.detection.blsPeriod.value}
                                    epoch={analysisResult.detection.transitFitParameters.epoch}
                                    duration={analysisResult.detection.transitFitParameters.duration}
                                />
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {analysisResult.detection.blsPowerSpectrum && (
                                     <BlsPowerSpectrumChart data={analysisResult.detection.blsPowerSpectrum} bestPeriod={analysisResult.detection.blsPeriod.value} />
                                )}
                               {analysisResult.detection.phaseFoldedLightCurve && analysisResult.detection.transitFitModel && (
                                    <PhaseFoldedLightCurveChart data={analysisResult.detection.phaseFoldedLightCurve} modelData={analysisResult.detection.transitFitModel} />
                               )}
                            </div>
                             {analysisResult.lightCurve && analysisResult.lightCurve.length > 0 && analysisResult.detection.transitFitModel && (
                                <TransitDetailChart
                                    lightCurve={analysisResult.lightCurve}
                                    period={analysisResult.detection.blsPeriod.value}
                                    epoch={analysisResult.detection.transitFitParameters.epoch}
                                    duration={analysisResult.detection.transitFitParameters.duration}
                                    modelData={analysisResult.detection.transitFitModel}
                                />
                             )}
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <TransitFitParameters params={analysisResult.detection.transitFitParameters}/>
                                <DetrendingInfoCard />
                            </div>
                        </div>
                    </div>

                    {/* Habitability & Classification */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {analysisResult.habitability && analysisResult.atmosphere && (
                            <HabitabilityCard habitability={analysisResult.habitability} atmosphere={analysisResult.atmosphere} />
                       )}
                       <MachineLearningClassifier result={analysisResult.classification} />
                    </div>

                     {/* Advanced Validation Section */}
                     <div className="p-4 rounded-lg bg-space-blue/30 border border-space-light/50">
                        <h2 className="text-2xl font-display text-accent-gold tracking-wider text-center mb-4">Advanced Validation & Modeling</h2>
                         <div className="space-y-8">
                            {analysisResult.radialVelocityCurve && analysisResult.radialVelocityCurve.length > 0 && (
                                <RadialVelocityChart data={analysisResult.radialVelocityCurve} />
                            )}
                            {analysisResult.lightCurve && analysisResult.lightCurve.length > 0 && (
                                <InjectionRecovery lightCurve={analysisResult.lightCurve} originalPeriod={analysisResult.detection.blsPeriod.value} originalDepth={analysisResult.detection.transitFitParameters.depth} />
                            )}
                            <MlPerformanceMetrics />
                            <BayesianOptimization />
                        </div>
                    </div>

                    {/* Research & Comparison */}
                    {analysisResult.research && (
                        <ResearchSummary summary={analysisResult.research.summary} abstract={analysisResult.research.abstract} />
                    )}
                    {analysisResult.comparisonData && analysisResult.comparisonData.length > 0 && (
                        <ComparisonTable data={analysisResult.comparisonData} />
                    )}

                    {/* Export Buttons */}
                    <div className="text-center pt-4 space-x-2 flex flex-wrap justify-center gap-2">
                         <button onClick={() => exportAnalysisToJSON(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Export to JSON</button>
                         <button onClick={() => exportAnalysisToCSV(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Export to CSV</button>
                         <button onClick={() => generatePdfReport(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Generate PDF Report</button>
                         <button onClick={() => generatePresentation(analysisResult)} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md">Generate Presentation</button>
                         <button onClick={handleGenerateReport} className="bg-accent-gold text-space-dark font-semibold py-2 px-4 rounded-md">Generate Research Report</button>
                    </div>

                    <Chatbot />
                </div>
            )}
            
            {isReportModalOpen && (
                <ResearchReportModal 
                    reportMarkdown={reportMarkdown}
                    onClose={() => setIsReportModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ExoplanetFinder;