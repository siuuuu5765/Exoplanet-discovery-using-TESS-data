// types.ts

// The primary, unified data structure for the entire application.
// This structure is populated by the systemProfileService, which merges
// data from multiple real astronomical sources.
export interface VerifiedSystemProfile {
  TIC_ID: string;
  Star: {
    Name: string | 'Not Available';
    Distance_ly: number | 'Not Available';
    Apparent_Magnitude: number | 'Not Available';
    Temperature_K: number | 'Not Available';
    Radius_Rsun: number | 'Not Available';
    Mass_Msun: number | 'Not Available';
    Luminosity_Lsun: number | 'Not Available';
    Surface_Gravity_logg: number | 'Not Available';
    Metallicity_FeH: number | 'Not Available';
    Coordinates: {
      RA_deg: number | 'Not Available';
      Dec_deg: number | 'Not Available';
    }
  };
  Planet: {
    Name: string | 'Not Available';
    Orbital_Period_days: number | 'Not Available';
    Planet_Radius_Rearth: number | 'Not Available';
    Planet_Mass_Mearth: number | 'Not Available';
    Equilibrium_Temperature_K: number | 'Not Available';
    SemiMajorAxis_AU: number | 'Not Available';
  };
  Source: {
    Distance: string;
    Other_Stellar_Params: string;
    Planet_Params: string;
  };
}


// These types are now used for visualization purposes only,
// populated by a deterministic mock generator.
export interface LightCurvePoint {
  time: number;
  brightness: number;
}

export interface RadialVelocityPoint {
  time: number;
  velocity: number;
}

export interface PhaseFoldedPoint {
  phase: number;
  brightness: number;
}

export interface BlsResultPoint {
  period: number;
  power: number;
}

export interface ComparisonData {
    parameter: string;
    candidate: string | number;
    earth: string | number;
    jupiter: string | number;
}

export interface HabitabilityAnalysis {
  Habitability_Score: number;
  Components: {
    Temperature_Score: number | 'Not Available';
    Flux_Score: number | 'Not Available';
    Size_Score: number | 'Not Available';
    Gravity_Score: number | 'Not Available';
    Orbit_Stability_Score: number | 'Not Available';
  };
  Interpretation: string;
}

export interface AtmosphericComposition {
    gases: { gas: string; percentage: number }[];
    rationale: string;
}

// Wrapper type for the full analysis result passed to components
export interface FullAnalysis {
  profile: VerifiedSystemProfile;
  lightCurve: LightCurvePoint[];
  radialVelocityCurve: RadialVelocityPoint[];
  blsPowerSpectrum: BlsResultPoint[];
  phaseFoldedLightCurve: PhaseFoldedPoint[];
  transitFitModel: PhaseFoldedPoint[];
  blsPeriod: number;
  transitDepth: number;
  transitDuration: number;
  transitEpoch: number;
  // AI Generated Content
  aiAnalysis: string;
  researchSummary: string;
  comparisonData: ComparisonData[];
  habitabilityAnalysis: HabitabilityAnalysis;
  atmosphericComposition: AtmosphericComposition;
}

// Type for batch analysis results
export interface BatchResult {
    ticId: string;
    status: 'success' | 'failure';
    profile?: VerifiedSystemProfile;
}