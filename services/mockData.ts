// services/mockData.ts
import { calculateHabitability } from './geminiService';
import type { PlanetAnalysis, ClassificationPrediction } from '../types';

// FIX: Generate a mock analysis object for demonstration or testing purposes.
export const generateMockAnalysis = (ticId: string = 'mock-12345'): PlanetAnalysis => {
    const period = 3 + Math.random() * 10;
    const planetRadius = 0.8 + Math.random() * 1.5;
    const transitDepth = Math.pow(planetRadius / 11.2, 2) * 0.9; // Simplified depth calculation

    const lightCurve = [];
    const transitDurationHours = 2 + Math.random();
    for (let i = 0; i < 2000; i++) {
        const time = i * 0.2; // 2000 points, 0.2 hours apart
        let brightness = 1.0 + (Math.random() - 0.5) * 0.0005;
        // Simulate transit
        const timeInCycle = (time % (period * 24));
        if (timeInCycle > (period * 24 / 2) - transitDurationHours / 2 && timeInCycle < (period * 24 / 2) + transitDurationHours / 2) {
             brightness -= transitDepth;
        }
        lightCurve.push({ time, brightness });
    }
    
    const blsPowerSpectrum = [];
    for (let p = 1; p < 20; p += 0.1) {
        let power = 5 + Math.random() * 5;
        if (Math.abs(p - period) < 0.1) {
            power = 25 + Math.random() * 5; // Peak at the correct period
        }
        blsPowerSpectrum.push({ period: p, power });
    }

    const phaseFoldedLightCurve = [];
    const modelFit = [];
    const transitDurationPhase = (transitDurationHours / (period * 24));
    for(let i=0; i<300; i++) {
        const phase = Math.random() - 0.5;
        let brightness = 1.0 + (Math.random() - 0.5) * 0.001;
        if (Math.abs(phase) < transitDurationPhase / 2) {
             brightness -= transitDepth * (1 + (Math.random()-0.5) * 0.1);
        }
        phaseFoldedLightCurve.push({ phase, brightness });
    }
    phaseFoldedLightCurve.sort((a,b) => a.phase - b.phase);

    for (let phase = -0.5; phase <= 0.5; phase += 0.01) {
        let brightness = 1.0;
        if (Math.abs(phase) < transitDurationPhase / 2) {
             brightness -= transitDepth;
        }
        modelFit.push({ phase, brightness });
    }

    // Generate realistic classification data
    const isPlanet = Math.random() < 0.9;
    const bestGuess = isPlanet ? 'Planet Candidate' : 'Eclipsing Binary';
    const topConfidence = 0.8 + Math.random() * 0.19; // 80% to 99.9%
    const remaining = 1.0 - topConfidence;
    const c2 = remaining * (0.5 + Math.random() * 0.2);
    const c3 = (remaining - c2) * (0.6 + Math.random() * 0.2);
    const c4 = remaining - c2 - c3;

    const classes = ['Planet Candidate', 'Eclipsing Binary', 'Stellar Variability', 'Noise'];
    const otherClasses = classes.filter(c => c !== bestGuess);
    const shuffledRemaining = [c2, c3, c4].sort(() => Math.random() - 0.5);

    const cnnPredictions: ClassificationPrediction[] = [
      { class: bestGuess, confidence: topConfidence },
      { class: otherClasses[0], confidence: shuffledRemaining[0] },
      { class: otherClasses[1], confidence: shuffledRemaining[1] },
      { class: otherClasses[2], confidence: shuffledRemaining[2] },
    ];
    
    const explanation = `Detected consistent ${period.toFixed(2)}-day periodic dips with a depth of ${(transitDepth * 100).toFixed(2)}%, corresponding to a ${planetRadius.toFixed(1)} Earth-radius object.`;
    
    const abstract = `We report the discovery of a new exoplanet candidate, ${ticId} b, identified from simulated TESS data. The candidate exhibits periodic transit events with a period of ${period.toFixed(2)} days and a depth of ${(transitDepth * 100).toFixed(2)}%, suggesting an object with a radius of ${planetRadius.toFixed(2)} R⊕ orbiting a G-type star. Machine learning classification using both a 1D CNN and a Random Forest model strongly supports the planetary nature of the signal with high confidence. The analysis indicates a compelling candidate for further investigation.`;

    const summary = `The analysis pipeline began with detrending the raw light curve to remove instrumental and stellar noise. A Box-fitting Least Squares (BLS) algorithm was applied, revealing a significant periodic signal at ${period.toFixed(2)} days. The light curve was then phase-folded to this period, clearly showing a transit-like dip which was used to derive the planet's radius. The signal was vetted by machine learning models, which confirmed its planetary characteristics.\n\nThe candidate's position in the habitable zone makes it a compelling target. Future research should focus on obtaining radial velocity measurements to confirm its mass and density. Subsequent atmospheric characterization with facilities like JWST could search for potential biosignatures.`;

    const planetData = {
        name: 'Mock Planet b',
        period: { value: period, uncertainty: 0.001 },
        radius: { value: planetRadius, uncertainty: 0.05 },
        mass: { value: planetRadius * 1.2, uncertainty: 0.2 },
        temperature: 250 + Math.random() * 100, // Random temp between 250-350K
    };
    
    const starData = {
        name: 'Mock Star Alpha',
        type: ['G', 'K', 'M'][Math.floor(Math.random() * 3)] + '-type main-sequence',
        apparentMagnitude: 10.5,
        distance: 450,
    };

    const calculatedHabitability = calculateHabitability(planetData, starData);

    return {
        ticId: ticId,
        lightCurve,
        radialVelocityCurve: [
            { time: 0, velocity: 1.5 }, { time: period/4, velocity: 0 },
            { time: period/2, velocity: -1.5 }, { time: 3*period/4, velocity: 0 },
            { time: period, velocity: 1.5 }
        ],
        detection: {
            blsPeriod: { value: period, uncertainty: 0.001 },
            blsPowerSpectrum,
            phaseFoldedLightCurve,
            transitFitModel: modelFit,
            transitFitParameters: {
                depth: transitDepth,
                duration: transitDurationHours,
                impactParameter: 0.5,
                epoch: 1234.5678,
            },
        },
        star: starData,
        planet: planetData,
        atmosphere: {
            composition: [
                { chemical: 'Nitrogen', percentage: 70 },
                { chemical: 'Oxygen', percentage: 15 },
                { chemical: 'Carbon Dioxide', percentage: 10 },
                { chemical: 'Methane', percentage: 5 },
            ],
            description: "A thick, nitrogen-dominated atmosphere with significant greenhouse gases.",
        },
        habitability: calculatedHabitability,
        classification: {
            cnn: {
                bestGuess: bestGuess,
                predictions: cnnPredictions,
                explanation: explanation,
            },
            randomForest: {
                bestGuess: bestGuess,
                predictions: cnnPredictions.sort((a,b) => 0.5 - Math.random()), // slightly different order for variety
                featureImportance: [
                    { feature: 'depth', score: 0.45 },
                    { feature: 'period', score: 0.30 },
                    { feature: 'duration', score: 0.15 },
                    { feature: 'snr', score: 0.10 },
                ],
                explanation: explanation,
            },
        },
        research: {
            abstract,
            summary,
        },
        comparisonData: [
            { property: "Orbital Period (days)", value: period.toFixed(3), source: 'Gemini' },
            { property: "Orbital Period (days)", value: (period * 1.01).toFixed(3), source: 'Archive' },
            { property: "Planet Radius (R_Earth)", value: planetRadius.toFixed(2), source: 'Gemini' },
            { property: "Planet Radius (R_Earth)", value: (planetRadius * 0.98).toFixed(2), source: 'Archive' },
        ],
    };
};