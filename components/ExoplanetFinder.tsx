import React, { useState } from 'react';
import { getAiModels } from '../services/geminiService';
import type { PlanetAnalysis, BlsParameters } from '../types';
import { Type } from '@google/genai';

// Import all the sub-components
import LightCurveChart from './LightCurveChart';
import RadialVelocityChart from './RadialVelocityChart';
import PlanetVisualizer from './PlanetVisualizer';
import ChemicalComposition from './ChemicalComposition';
import HabitabilityCard from './HabitabilityCard';
import MachineLearningClassifier from './MachineLearningClassifier';
import BlsParametersComponent from './BlsParameters';
import BlsPowerSpectrumChart from './BlsPowerSpectrumChart';
import PhaseFoldedLightCurveChart from './PhaseFoldedLightCurveChart';
import PlanetProfileCard from './PlanetProfileCard'; // New Import
import InjectionRecovery from './InjectionRecovery';
import ComparisonTable from './ComparisonTable';
import { PlanetIcon, ChartLineIcon, SignalIcon, CpuChipIcon } from './Icons';

const planetAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        ticId: { type: Type.STRING },
        detectionSnr: { type: Type.NUMBER, description: "Signal-to-Noise Ratio of the BLS detection. Should be higher than the snrCutoff parameter." },
        star: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, description: "e.g., G-type, M-dwarf" },
                radius: { type: Type.NUMBER, description: "In solar radii" },
                mass: { type: Type.NUMBER, description: "In solar mass" },
                apparentMagnitude: { type: Type.NUMBER, description: "The star's apparent magnitude (brightness from Earth)." }
            },
            required: ["type", "radius", "mass", "apparentMagnitude"]
        },
        planet: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "A creative, plausible name for the exoplanet." },
                period: { type: Type.NUMBER, description: "Orbital period in days" },
                radius: { type: Type.NUMBER, description: "Planet radius in Earth radii" },
                depth: { type: Type.NUMBER, description: "Transit depth as a fraction (e.g., 0.01 for 1%)" },
                inclination: { type: Type.NUMBER, description: "Orbital inclination in degrees" },
                semiMajorAxis: { type: Type.NUMBER, description: "Semi-major axis in AU" },
            },
            required: ["name", "period", "radius", "depth", "inclination", "semiMajorAxis"]
        },
        habitability: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "A score from 0-10 for habitability potential." },
                inHabitableZone: { type: Type.BOOLEAN, description: "Is the planet in the star's habitable zone?" },
            },
            required: ["score", "inHabitableZone"]
        },
        atmosphere: {
            type: Type.OBJECT,
            properties: {
                composition: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            chemical: { type: Type.STRING },
                            percentage: { type: Type.NUMBER },
                        },
                        required: ["chemical", "percentage"]
                    }
                }
            },
            required: ["composition"]
        },
        classification: {
            type: Type.OBJECT,
            properties: {
                cnn: {
                    type: Type.OBJECT,
                    properties: {
                        bestGuess: { type: Type.STRING },
                        predictions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    class: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER }
                                },
                                required: ["class", "confidence"]
                            }
                        }
                    },
                     required: ["bestGuess", "predictions"]
                },
                randomForest: {
                    type: Type.OBJECT,
                    properties: {
                        bestGuess: { type: Type.STRING },
                        predictions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    class: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER }
                                },
                                required: ["class", "confidence"]
                            }
                        },
                        featureImportance: {
                             type: Type.ARRAY,
                             items: {
                                type: Type.OBJECT,
                                properties: {
                                    feature: { type: Type.STRING },
                                    score: { type: Type.NUMBER }
                                },
                                required: ["feature", "score"]
                             }
                        }
                    },
                    required: ["bestGuess", "predictions", "featureImportance"]
                }
            },
            required: ["cnn", "randomForest"]
        },
        lightCurve: {
            type: Type.ARRAY,
            description: "Generate 1000 data points representing a realistic light curve over 600 hours with a clear transit dip corresponding to the planet's properties. Add some realistic stellar noise/variability.",
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.NUMBER, description: "Time in hours" },
                    brightness: { type: Type.NUMBER, description: "Normalized brightness" }
                },
                required: ["time", "brightness"]
            }
        },
        radialVelocity: {
            type: Type.ARRAY,
            description: "Generate 50 data points for a radial velocity curve over 2 full orbital periods, showing the star's 'wobble'.",
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.NUMBER, description: "Time in days" },
                    velocity: { type: Type.NUMBER, description: "Velocity in m/s" }
                },
                required: ["time", "velocity"]
            }
        },
        blsPowerSpectrum: {
            type: Type.ARRAY,
            description: "Generate 200 data points for a Box-fitting Least Squares (BLS) power spectrum. Show a very strong peak at the planet's actual period, with some smaller noise peaks elsewhere.",
            items: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.NUMBER },
                    power: { type: Type.NUMBER }
                },
                required: ["period", "power"]
            }
        },
        phaseFoldedLightCurve: {
            type: Type.ARRAY,
            description: "Generate 200 data points of the light curve folded on the detected period. The points should clearly form the U-shaped transit.",
            items: {
                type: Type.OBJECT,
                properties: {
                    phase: { type: Type.NUMBER, description: "Orbital phase from -0.5 to 0.5" },
                    brightness: { type: Type.NUMBER }
                },
                required: ["phase", "brightness"]
            }
        },
        phaseFoldedModel: {
            type: Type.ARRAY,
            description: "Generate 100 data points for a smooth transit model that fits the phase-folded light curve.",
            items: {
                type: Type.OBJECT,
                properties: {
                    phase: { type: Type.NUMBER },
                    brightness: { type: Type.NUMBER }
                },
                required: ["phase", "brightness"]
            }
        },
    },
    required: [ "ticId", "detectionSnr", "star", "planet", "habitability", "atmosphere", "classification", "lightCurve", "radialVelocity", "blsPowerSpectrum", "phaseFoldedLightCurve", "phaseFoldedModel" ]
};

type Tab = 'profile' | 'lightcurve' | 'detection' | 'ml';

const ExoplanetFinder: React.FC = () => {
    const [ticId, setTicId] = useState<string>('307210830');
    const [blsParams, setBlsParams] = useState<BlsParameters>({
        periodRange: [1, 20],
        depthThreshold: 0.001,
        snrCutoff: 7,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<PlanetAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const prompt = `
            You are an advanced astronomical data simulator and analyst.
            For the given TESS Input Catalog (TIC) ID: ${ticId}, generate a complete, realistic, but fictional dataset for a newly discovered exoplanet.
            The data should be scientifically plausible and internally consistent.
            
            Key analysis parameters for your simulation:
            - BLS Period Search Range: ${blsParams.periodRange[0]} to ${blsParams.periodRange[1]} days.
            - BLS SNR Cutoff: ${blsParams.snrCutoff}.
            - BLS Depth Threshold: ${blsParams.depthThreshold}.
            
            Generate a comprehensive JSON object that includes detailed information about the host star, the exoplanet's properties, habitability analysis, atmospheric composition, machine learning classification results, and all necessary data points for plotting various analytical charts (light curve, radial velocity, etc.). Ensure the planet's period falls within the specified search range. The transit depth must be greater than the depth threshold. The BLS power spectrum peak should be high enough so the resulting detection SNR exceeds the SNR cutoff.
            
            The star for TIC ${ticId} is a real star. Base the star's properties (type, radius, mass, apparentMagnitude) on its known characteristics, but the planet itself should be your invention. Make the scenario interesting - perhaps a rocky super-Earth in the habitable zone of a K-dwarf star.
            
            Fill out the entire JSON schema provided.
        `;

        try {
            const aiModels = getAiModels();
            const response = await aiModels.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: planetAnalysisSchema,
                    temperature: 0.5,
                }
            });
            const result = JSON.parse(response.text);
            setAnalysisResult(result);
            setActiveTab('profile'); // Reset to profile tab on new analysis
        } catch (e: any) {
            console.error("Analysis failed:", e);
            setError(`Failed to analyze TIC ID ${ticId}. The model may have returned an invalid response or a network error occurred. Please check the console and try again.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderTabContent = () => {
        if (!analysisResult) return null;
    
        switch (activeTab) {
          case 'profile':
            return (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PlanetVisualizer planetName={analysisResult.planet.name} planetRadius={analysisResult.planet.radius} starType={analysisResult.star.type} />
                    <HabitabilityCard score={analysisResult.habitability.score} inZone={analysisResult.habitability.inHabitableZone} />
                    <ChemicalComposition composition={analysisResult.atmosphere.composition} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PlanetProfileCard
                      planet={analysisResult.planet}
                      star={analysisResult.star}
                      detectionSnr={analysisResult.detectionSnr}
                    />
                     <div className="bg-space-blue/50 p-4 rounded-lg">
                        <RadialVelocityChart data={analysisResult.radialVelocity} />
                    </div>
                 </div>
                 <ComparisonTable foundPlanet={analysisResult.planet} />
              </div>
            );
          case 'lightcurve':
            return (
              <div className="bg-space-blue/50 p-4 rounded-lg">
                <LightCurveChart data={analysisResult.lightCurve} />
              </div>
            );
          case 'detection':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-space-blue/50 p-4 rounded-lg">
                        <BlsPowerSpectrumChart data={analysisResult.blsPowerSpectrum} detectedPeriod={analysisResult.planet.period} />
                    </div>
                    <div className="bg-space-blue/50 p-4 rounded-lg">
                        <PhaseFoldedLightCurveChart data={analysisResult.phaseFoldedLightCurve} modelData={analysisResult.phaseFoldedModel} />
                    </div>
                 </div>
            );
          case 'ml':
            return (
                <div className="max-w-2xl mx-auto">
                    <MachineLearningClassifier result={analysisResult.classification} />
                </div>
            );
          default:
            return null;
        }
      };

    return (
        <div className="space-y-8">
            <div className="bg-space-blue/30 p-6 rounded-lg shadow-lg border border-space-light backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input
                        type="text"
                        value={ticId}
                        onChange={(e) => setTicId(e.target.value)}
                        placeholder="Enter TIC ID (e.g., 307210830)"
                        className="flex-grow w-full sm:w-auto bg-space-dark border border-space-light rounded-md px-4 py-2 text-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-accent-cyan text-space-dark font-bold py-2 px-6 rounded-md hover:bg-accent-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Signal'}
                    </button>
                </div>
                <BlsParametersComponent params={blsParams} setParams={setBlsParams} disabled={isLoading} />
            </div>

            {isLoading && (
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
                    <p className="text-gray-300 mt-2">Conjuring a new world... The AI is processing the stellar data.</p>
                </div>
            )}

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg text-center">
                    <p className="font-bold">Analysis Error</p>
                    <p>{error}</p>
                </div>
            )}

            {analysisResult && (
                <div className="space-y-8 animate-fade-in">
                    <section>
                         <h2 className="text-3xl font-display text-accent-gold text-center mb-6">Analysis Dashboard for {analysisResult.planet.name}</h2>
                         <div className="border-b border-space-light mb-4 flex justify-center space-x-2 md:space-x-4">
                             {[
                                 { id: 'profile', label: 'Planet Profile', icon: PlanetIcon },
                                 { id: 'lightcurve', label: 'Lightcurve', icon: ChartLineIcon },
                                 { id: 'detection', label: 'Transit Detection', icon: SignalIcon },
                                 { id: 'ml', label: 'ML Prediction', icon: CpuChipIcon },
                             ].map(tab => (
                                 <button
                                     key={tab.id}
                                     onClick={() => setActiveTab(tab.id as Tab)}
                                     className={`flex items-center space-x-2 px-3 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
                                         activeTab === tab.id
                                         ? 'border-accent-cyan text-accent-cyan'
                                         : 'border-transparent text-gray-400 hover:text-white'
                                     }`}
                                 >
                                     <tab.icon className="w-5 h-5" />
                                     <span className="hidden md:inline">{tab.label}</span>
                                 </button>
                             ))}
                         </div>
                         <div className="p-4 bg-space-blue/20 rounded-lg">
                            {renderTabContent()}
                         </div>
                    </section>
                    
                    <section>
                        <InjectionRecovery 
                            lightCurve={analysisResult.lightCurve} 
                            originalPeriod={analysisResult.planet.period} 
                            originalDepth={analysisResult.planet.depth}
                        />
                    </section>
                </div>
            )}
        </div>
    );
};

export default ExoplanetFinder;