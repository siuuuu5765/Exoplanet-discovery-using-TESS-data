// types.ts

export interface ValueWithUncertainty {
  value: number;
  uncertainty: number;
}

export interface LightCurvePoint {
  time: number;
  brightness: number;
}

export interface RadialVelocityPoint {
  time: number;
  velocity: number;
}

export interface BlsResultPoint {
  period: number;
  power: number;
}

export interface PhaseFoldedPoint {
  phase: number;
  brightness: number;
}

export interface Chemical {
  chemical: string;
  percentage: number;
}

export interface AtmosphericData {
  pressure: number; // in bars
  composition: Chemical[];
}

export interface FeatureImportance {
  feature: 'period' | 'depth' | 'duration' | 'snr';
  score: number;
}

export interface ClassificationPrediction {
  class: 'Planet Candidate' | 'Eclipsing Binary' | 'Stellar Variability' | 'Noise';
  confidence: number;
}

export interface ClassifierOutput {
  bestGuess: string;
  predictions: ClassificationPrediction[];
  featureImportance?: FeatureImportance[];
}

export interface MachineLearningClassification {
  cnn: ClassifierOutput;
  randomForest: ClassifierOutput;
}

export interface HabitabilityData {
  score: number;
  inHabitableZone: boolean;
}

export interface TransitFitParams {
  depth: number;
  duration: number; // hours
  impactParameter: number;
  epoch: number; // BJD
}

export interface DetectionData {
  blsPeriod: ValueWithUncertainty;
  snr: number;
  powerSpectrum: BlsResultPoint[];
  phaseFoldedLightCurve: PhaseFoldedPoint[];
  transitFitModel: PhaseFoldedPoint[];
  transitFitParams: TransitFitParams;
}

export interface PlanetData {
  name: string;
  radius: ValueWithUncertainty;
  mass: ValueWithUncertainty;
  period: ValueWithUncertainty;
  temperature: number; // Kelvin
}

export interface StarData {
  name: string;
  type: string;
  apparentMagnitude: number;
  distance: number; // light-years
}

export interface VerificationStatus {
  status: 'Known Planet' | 'New Candidate';
  knownName?: string;
  archiveUrl: string;
}

export interface PlanetAnalysis {
  ticId: string;
  planet: PlanetData;
  star: StarData;
  lightCurve: LightCurvePoint[];
  radialVelocityCurve: RadialVelocityPoint[];
  atmosphere: AtmosphericData | null;
  habitability: HabitabilityData;
  detection: DetectionData;
  classification: MachineLearningClassification;
  verification: VerificationStatus;
  researchSummary: string;
  researchAbstract: string; // New field for the abstract
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface BlsParameters {
  periodRange: [number, number];
  depthThreshold: number;
  snrCutoff: number;
}

export interface InjectionResult {
    injectedPeriod: number;
    injectedDepth: number;
    recovered: boolean;
    recoveredPeriod?: number;
}

export type BatchResult = (PlanetAnalysis & { status: 'success' }) | { ticId: string; status: 'error'; message: string };

export interface ComparisonData {
    property: string;
    value: string;
    source: 'Gemini' | 'TESS Archive';
}
