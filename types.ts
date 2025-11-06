// types.ts

// Basic data point for a light curve
export interface LightCurvePoint {
  time: number; // in hours
  brightness: number; // normalized
}

// Data point for radial velocity
export interface RadialVelocityPoint {
  time: number; // in days
  velocity: number; // in m/s
}

// A single chemical element in an atmosphere
export interface Chemical {
  chemical: string;
  percentage: number;
}

// Parameters for Box-fitting Least Squares algorithm
export interface BlsParameters {
    periodRange: [number, number];
    depthThreshold: number;
    snrCutoff: number;
}

// Data point for BLS power spectrum
export interface BlsResultPoint {
    period: number;
    power: number;
}

// Data point for phase-folded light curve
export interface PhaseFoldedPoint {
    phase: number;
    brightness: number;
}

// Parameters from the transit model fit
export interface TransitFitParams {
    depth: number;
    duration: number;
    impactParameter: number;
    epoch: number;
}

// For ML Classifier: individual prediction
export interface ClassificationPrediction {
    class: string;
    confidence: number;
}

// For ML Classifier: feature importance
export interface FeatureImportance {
    feature: string;
    score: number;
}

// For ML Classifier: output of one model
export interface ClassifierOutput {
    bestGuess: string;
    predictions: ClassificationPrediction[];
    featureImportance?: FeatureImportance[];
}

// For data source comparison
export interface ComparisonData {
    property: string;
    value: string;
    source: 'Gemini' | 'Archive';
}

// Represents a value with uncertainty
export interface Measurement {
    value: number;
    uncertainty: number;
}

// The main analysis object
export interface PlanetAnalysis {
  ticId: string;
  lightCurve?: LightCurvePoint[];
  radialVelocityCurve?: RadialVelocityPoint[];
  detection: {
    blsPeriod: Measurement;
    blsPowerSpectrum: BlsResultPoint[];
    phaseFoldedLightCurve: PhaseFoldedPoint[];
    transitFitModel: PhaseFoldedPoint[];
    transitFitParameters: TransitFitParams;
  };
  star: {
    name: string;
    type: string;
    apparentMagnitude: number;
    distance: number;
  };
  planet: {
    name: string;
    period: Measurement;
    radius: Measurement;
    mass: Measurement;
    temperature: number; // in Kelvin
  };
  atmosphere?: {
    composition: Chemical[];
    description: string;
  };
  habitability?: {
    score: number; // out of 10
    inHabitableZone: boolean;
    summary: string;
  };
  classification: {
      cnn: ClassifierOutput;
      randomForest: ClassifierOutput;
  };
  research?: {
      abstract: string;
      summary: string;
  };
  comparisonData?: ComparisonData[];
}

// For chat messages
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
}

// For batch analysis results
export interface BatchResult {
    ticId: string;
    status: 'success' | 'error';
    classification?: PlanetAnalysis['classification'];
    detection?: PlanetAnalysis['detection'];
    planet?: PlanetAnalysis['planet'];
}

// For injection-recovery tests
export interface InjectionResult {
    injectedPeriod: number;
    injectedDepth: number;
    recovered: boolean;
    recoveredPeriod?: number;
}