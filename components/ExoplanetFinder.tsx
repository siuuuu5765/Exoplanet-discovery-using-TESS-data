// components/ExoplanetFinder.tsx
import React, { useState, useEffect } from 'react';
import { generateMockPlanetAnalysis } from '../services/mockData';
import { generatePdfReport } from '../services/pdfGenerator';
import { exportAnalysisToJSON, exportAnalysisToCSV } from '../services/exportService';
import { generatePresentation } from '../services/presentationPackService';
import { setChatbotContext } from '../services/geminiService';
import type { PlanetAnalysis, BlsParameters } from '../types';
import DataCard from './DataCard';
import LightCurveChart from './LightCurveChart';
import PlanetVisualizer from './PlanetVisualizer';
import ChemicalComposition from './ChemicalComposition';
import HabitabilityCard from './HabitabilityCard';
import RadialVelocityChart from './RadialVelocityChart';
import BlsParametersComponent from './BlsParameters';
import BlsPowerSpectrumChart from './BlsPowerSpectrumChart';
import PhaseFoldedLightCurveChart from './PhaseFoldedLightCurveChart';
import MachineLearningClassifier from './MachineLearningClassifier';
import InjectionRecovery from './InjectionRecovery';
import PlanetSelector from './PlanetSelector';
import ResearchSummary from './ResearchSummary';
// FIX: Import missing components to resolve "Cannot find name" errors.
import TransitFitParameters from './TransitFitParameters';
import MlPerformanceMetrics from './MlPerformanceMetrics';
import Chatbot from './Chatbot';
// FIX: Import missing icon to resolve "Cannot find name" error.
import { DocumentTextIcon, ArchiveBoxIcon, ArrowDownTrayIcon, DocumentArrowDownIcon } from './Icons';

type Tab = 'profile' | 'lightcurve' | 'detection' | 'ml' | 'summary';

const ExoplanetFinder: React.FC = () => {
    const [ticId, setTicId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<PlanetAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const [blsParams, setBlsParams] = useState<BlsParameters>({
        periodRange: [0.5, 30],
        depthThreshold: 0.01,
        snrCutoff: 7.0,
    });

    useEffect(() => {
        setChatbotContext(analysisResult);
    }, [analysisResult]);

    const fetchAndAnalyzeTicData = async (id: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        // Simulate API call
        await new Promise(res => setTimeout(res, 1500));

        try {
            if (!id.trim()) {
                throw new Error("Please enter a valid TIC ID.");
            }
            // For this version, we'll always use the mock data generator.
            const result = generateMockPlanetAnalysis(id);
            setAnalysisResult(result);
            setActiveTab('profile'); // Reset to profile tab on new analysis
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAndAnalyzeTicData(ticId);
    };
    
    const TabButton: React.FC<{tabId: Tab, activeTab: Tab, onClick: (tab: Tab) => void, children: React.ReactNode}> = ({tabId, activeTab, onClick, children}) => (
        <button
            onClick={() => onClick(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === tabId
                ? 'border-accent-cyan text-accent-cyan'
                : 'border-transparent text-gray-400 hover:border-accent-cyan/50 hover:text-gray-200'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="container mx-auto px-4">
            <div className="bg-space-blue/30 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-space-light/50 shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={ticId}
                        onChange={(e) => setTicId(e.target.value)}
                        placeholder="Enter TIC ID (e.g., 307210830) or 'mock'"
                        className="flex-grow bg-space-dark/80 border border-space-light rounded-md p-3 text-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-magenta"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-accent-cyan text-space-dark font-bold text-lg py-3 px-8 rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </form>

                <BlsParametersComponent params={blsParams} setParams={setBlsParams} disabled={isLoading} />
                <PlanetSelector onSelect={(id) => { setTicId(id); fetchAndAnalyzeTicData(id); }} disabled={isLoading} />
            </div>

            {error && <div className="text-center p-4 mt-8 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">{error}</div>}

            {analysisResult && (
                <div id="analysis-report" className="mt-8 animate-fade-in">
                    {/* Top-level summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <DataCard title="Planet Name" value={analysisResult.planet.name} />
                        <DataCard title="Host Star" value={analysisResult.star.name} />
                        <DataCard title="Best Period (BLS)" value={`${analysisResult.detection.blsPeriod.value.toFixed(3)} ± ${analysisResult.detection.blsPeriod.uncertainty.toFixed(4)} d`} />
                        <DataCard title="Detection SNR" value={analysisResult.detection.snr.toFixed(1)} />
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-space-light mb-6 flex justify-center flex-wrap">
                        <TabButton tabId="profile" activeTab={activeTab} onClick={setActiveTab}>Planet Profile</TabButton>
                        <TabButton tabId="lightcurve" activeTab={activeTab} onClick={setActiveTab}>Lightcurve</TabButton>
                        <TabButton tabId="detection" activeTab={activeTab} onClick={setActiveTab}>Transit Detection</TabButton>
                        <TabButton tabId="ml" activeTab={activeTab} onClick={setActiveTab}>ML Prediction</TabButton>
                        <TabButton tabId="summary" activeTab={activeTab} onClick={setActiveTab}>Research Summary</TabButton>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'profile' && (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1 space-y-6">
                                     <HabitabilityCard score={analysisResult.habitability.score} inZone={analysisResult.habitability.inHabitableZone} />
                                     {analysisResult.atmosphere && <ChemicalComposition composition={analysisResult.atmosphere.composition} />}
                                </div>
                                <div className="lg:col-span-2">
                                     <PlanetVisualizer planet={analysisResult.planet} star={analysisResult.star} />
                                </div>
                             </div>
                        )}
                        
                        {activeTab === 'lightcurve' && (
                            <>
                               <LightCurveChart data={analysisResult.lightCurve} />
                               <RadialVelocityChart data={analysisResult.radialVelocityCurve} />
                            </>
                        )}

                        {activeTab === 'detection' && (
                            <>
                                <BlsPowerSpectrumChart data={analysisResult.detection.powerSpectrum} bestPeriod={analysisResult.detection.blsPeriod.value} />
                                <PhaseFoldedLightCurveChart data={analysisResult.detection.phaseFoldedLightCurve} modelData={analysisResult.detection.transitFitModel} />
                                <TransitFitParameters params={analysisResult.detection.transitFitParams} />
                            </>
                        )}
                        
                        {activeTab === 'ml' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <MachineLearningClassifier result={analysisResult.classification} />
                                <MlPerformanceMetrics />
                            </div>
                        )}

                        {activeTab === 'summary' && (
                            <ResearchSummary summary={analysisResult.researchSummary} abstract={analysisResult.researchAbstract} />
                        )}
                    </div>
                    
                    {/* Injection Recovery and Exports only show after a successful analysis */}
                    <div className="mt-8 space-y-8">
                       <InjectionRecovery 
                            lightCurve={analysisResult.lightCurve} 
                            originalPeriod={analysisResult.planet.period.value}
                            originalDepth={analysisResult.detection.transitFitParams.depth}
                        />

                        <div className="bg-space-blue/30 p-4 rounded-lg text-center">
                            <h3 className="font-display font-bold text-accent-gold mb-3">Export & Reporting</h3>
                            <div className="flex justify-center gap-2 flex-wrap">
                                <button onClick={() => generatePdfReport(analysisResult)} className="bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
                                    <ArrowDownTrayIcon className="w-5 h-5"/> Download PDF Report
                                </button>
                                <button onClick={() => exportAnalysisToJSON(analysisResult)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
                                    <DocumentArrowDownIcon className="w-5 h-5"/> Export as JSON
                                </button>
                                <button onClick={() => exportAnalysisToCSV(analysisResult)} className="bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
                                    <DocumentArrowDownIcon className="w-5 h-5"/> Export as CSV
                                </button>
                                 <button onClick={() => generatePresentation(analysisResult)} className="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
                                    <ArchiveBoxIcon className="w-5 h-5"/> Generate PPTX Pack
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="h-24"></div> {/* Spacer for chatbot */}
             <Chatbot />
        </div>
    );
};

export default ExoplanetFinder;