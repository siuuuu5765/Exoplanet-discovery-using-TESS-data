export interface Chemical {
  chemical: string;
  percentage: number;
}

export interface LightCurvePoint {
  time: number;
  brightness: number;
}

export interface RadialVelocityPoint {
  time: number;
  velocity: number;
}

export interface ExoplanetData {
  isExoplanetHost: boolean;
  planetName: string;
  orbitalPeriod: number;
  planetRadius: number;
  starName: string;
  starType: string;
  distance: number;
  discoveryDate: string;
  description: string;
  chemicalComposition: Chemical[];
  lightCurveData: LightCurvePoint[];
  radialVelocityData: RadialVelocityPoint[];
  habitableZone: boolean;
  habitabilityScore: number; // A score from 0 to 10
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}
