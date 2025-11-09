// services/mockData.ts
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
        star: {
            name: 'Mock Star Alpha',
            type: 'G-type main-sequence',
            apparentMagnitude: 10.5,
            distance: 450,
        },
        planet: {
            name: 'Mock Planet b',
            period: { value: period, uncertainty: 0.001 },
            radius: { value: planetRadius, uncertainty: 0.05 },
            mass: { value: planetRadius * 1.2, uncertainty: 0.2 },
            temperature: 350,
        },
        atmosphere: {
            composition: [
                { chemical: 'Nitrogen', percentage: 70 },
                { chemical: 'Oxygen', percentage: 15 },
                { chemical: 'Carbon Dioxide', percentage: 10 },
                { chemical: 'Methane', percentage: 5 },
            ],
            description: "A thick, nitrogen-dominated atmosphere with significant greenhouse gases.",
        },
        habitability: {
            score: 7.8,
            inHabitableZone: true,
            summary: "This Earth-sized planet orbits within the star's habitable zone, where liquid water could potentially exist on its surface. The estimated temperature and atmospheric composition are promising for habitability.",
        },
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
            abstract: "We report the discovery of a new Earth-sized exoplanet candidate, Mock-12345 b, identified through analysis of simulated TESS data. The candidate exhibits periodic transit events with a period of approximately [Period] days, suggesting an object with a radius of [Radius] R_Earth orbiting a G-type star. Preliminary machine learning classification strongly supports the planetary nature of the signal. Further characterization is required to confirm the candidate and determine its atmospheric properties.",
            summary: "This research details the analysis pipeline used to identify the exoplanet candidate Mock-12345 b. Raw light curve data was first detrended to remove stellar and instrumental noise. A Box-fitting Least Squares (BLS) algorithm was then applied, revealing a significant periodic signal. The light curve was phase-folded to the detected period, clearly showing a transit-like dip. Machine learning models, including a 1D Convolutional Neural Network (CNN) and a Random Forest classifier, were used to vet the signal, both yielding a high probability of it being a planet candidate. Based on the transit depth and stellar parameters, the planet's radius was estimated. The orbital period places it within the star's habitable zone, making it a compelling target for future follow-up observations.",
        },
        comparisonData: [
            { property: "Orbital Period (days)", value: period.toFixed(3), source: 'Gemini' },
            { property: "Orbital Period (days)", value: (period * 1.01).toFixed(3), source: 'Archive' },
            { property: "Planet Radius (R_Earth)", value: planetRadius.toFixed(2), source: 'Gemini' },
            { property: "Planet Radius (R_Earth)", value: (planetRadius * 0.98).toFixed(2), source: 'Archive' },
        ],
    };
};