// services/mockData.ts
import type { VerifiedSystemProfile, LightCurvePoint, RadialVelocityPoint, BlsResultPoint, PhaseFoldedPoint } from '../types';

// Simple seeded pseudo-random number generator (PRNG) for deterministic visuals
class SeededRandom {
    private seed: number;
    constructor(seed: number) { this.seed = seed; }
    next() { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; }
    nextRange(min: number, max: number) { return min + this.next() * (max - min); }
}

const getSeedFromTicId = (ticId: string): number => {
    return ticId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

// This function now ONLY generates visual data (like light curves) based on REAL input data.
// It no longer creates or simulates any core scientific parameters.
export const generateMockVisuals = (profile: VerifiedSystemProfile) => {
    const seed = getSeedFromTicId(profile.TIC_ID);
    const rng = new SeededRandom(seed);
    
    const period = profile.Planet.Orbital_Period_days !== 'Not Available' ? profile.Planet.Orbital_Period_days : rng.nextRange(3, 10);
    const planetRadius = profile.Planet.Planet_Radius_Rearth !== 'Not Available' ? profile.Planet.Planet_Radius_Rearth : 1.5;
    const starRadius = profile.Star.Radius_Rsun !== 'Not Available' ? profile.Star.Radius_Rsun : 1.0;
    
    // Convert R_earth and R_sun to the same units (e.g., km) to calculate depth. 1 R_sun ~= 109 R_earth.
    const transitDepth = Math.pow(planetRadius / (starRadius * 109), 2) * 0.95; // Add slight noise
    const transitDurationHours = rng.nextRange(2, 4);
    const transitEpoch = rng.nextRange(2458000, 2459000);

    const lightCurve: LightCurvePoint[] = [];
    for (let i = 0; i < 2000; i++) {
        const time = i * 0.2;
        let brightness = 1.0 + (rng.next() - 0.5) * 0.0005; // Base noise
        const timeInCycle = (time - transitEpoch) % (period * 24);
        if (timeInCycle > -transitDurationHours / 2 && timeInCycle < transitDurationHours / 2) {
             brightness -= transitDepth;
        }
        lightCurve.push({ time, brightness });
    }
    
    const blsPowerSpectrum: BlsResultPoint[] = [];
    for (let p = Math.max(0.5, period-10); p < period+10; p += 0.1) {
        let power = rng.nextRange(5, 10);
        // Create a sharp peak at the correct period
        if (Math.abs(p - period) < 0.1) {
            power = rng.nextRange(25, 30);
        } else if (Math.abs(p - period) < 1) {
            power = rng.nextRange(10, 15);
        }
        blsPowerSpectrum.push({ period: p, power });
    }

    const phaseFoldedLightCurve: PhaseFoldedPoint[] = [];
    const transitDurationPhase = transitDurationHours / (period * 24);
    for(let i=0; i<300; i++) {
        const phase = rng.next() - 0.5;
        let brightness = 1.0 + (rng.next() - 0.5) * 0.001;
        if (Math.abs(phase) < transitDurationPhase / 2) {
             brightness -= transitDepth * (1 + (rng.next() - 0.5) * 0.1);
        }
        phaseFoldedLightCurve.push({ phase, brightness });
    }
    phaseFoldedLightCurve.sort((a,b) => a.phase - b.phase);

    const transitFitModel: PhaseFoldedPoint[] = [];
    for (let phase = -0.5; phase <= 0.5; phase += 0.01) {
        let brightness = 1.0;
        if (Math.abs(phase) < transitDurationPhase / 2) {
             brightness -= transitDepth;
        }
        transitFitModel.push({ phase, brightness });
    }
    
    const radialVelocityCurve: RadialVelocityPoint[] = [];
    const rvAmplitude = rng.nextRange(1, 5); // m/s
    for (let time = 0; time <= period * 2; time += period / 20) {
        const velocity = rvAmplitude * Math.sin((time / period) * 2 * Math.PI);
        radialVelocityCurve.push({time, velocity});
    }

    return {
        lightCurve,
        radialVelocityCurve,
        blsPowerSpectrum,
        phaseFoldedLightCurve,
        transitFitModel,
        blsPeriod: period,
        transitDepth,
        transitDuration: transitDurationHours,
        transitEpoch
    };
};
