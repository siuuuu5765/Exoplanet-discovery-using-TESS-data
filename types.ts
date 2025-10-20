// types.ts

export interface LightCurvePoint {
  time: number;
  brightness: number;
}

export interface RadialVelocityPoint {
  time: number;
  velocity: number;
}

export interface BlsPowerSpectrumPoint {
    period: number;
    power: number;
}

export interface PhaseFoldedPoint {
    phase: number;
    brightness: number;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export interface Chemical {
  chemical: string;
  percentage: number;
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

export interface ClassificationPrediction {
    class: string;
    confidence: number;
}

export interface FeatureImportance {
    feature: string;
    score: number;
}

export interface ClassifierOutput {
    bestGuess: string;
    predictions: ClassificationPrediction[];
    featureImportance?: FeatureImportance[];
}

export interface PlanetAnalysis {
    ticId: string;
    detectionSnr: number; // New: Detection significance
    star: {
        type: string;
        radius: number; // in solar radii
        mass: number; // in solar mass
        apparentMagnitude: number; // New: Star's brightness from Earth
    };
    planet: {
        name: string;
        period: number; // in days
        radius: number; // in Earth radii
        depth: number; // transit depth
        inclination: number; // in degrees
        semiMajorAxis: number; // in AU
    };
    habitability: {
        score: number;
        inHabitableZone: boolean;
    };
    atmosphere: {
        composition: Chemical[];
    };
    classification: {
        cnn: ClassifierOutput;
        randomForest: ClassifierOutput;
    };
    // Data for charts
    lightCurve: LightCurvePoint[];
    radialVelocity: RadialVelocityPoint[];
    blsPowerSpectrum: BlsPowerSpectrumPoint[];
    phaseFoldedLightCurve: PhaseFoldedPoint[];
    phaseFoldedModel: PhaseFoldedPoint[];
}