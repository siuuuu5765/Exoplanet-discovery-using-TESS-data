// services/mockData.ts
import type { PlanetAnalysis } from '../types';

const getRandomFloat = (min: number, max: number, decimals: number = 2) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
};

export const generateMockPlanetAnalysis = (ticId: string = 'mock-261136679'): PlanetAnalysis => {
  const period = getRandomFloat(1, 365, 3);
  const radius = getRandomFloat(0.5, 15, 2);
  const mass = getRandomFloat(0.1, 20, 2);
  const temperature = getRandomFloat(150, 2500, 0);
  const transitDepth = Math.pow(radius / 100, 2) * 0.9;
  const transitDuration = period / 20;

  const lightCurve = Array.from({ length: 2000 }, (_, i) => {
    const time = (i / 2000) * period * 3 * 24; // 3 cycles in hours
    let brightness = 1.0 + (Math.random() - 0.5) * 0.0005;
    const phase = (time / (period * 24)) % 1;
    if (phase > 0.49 && phase < 0.51) {
      brightness -= transitDepth;
    }
    return { time, brightness };
  });

  const blsPeriod = period + getRandomFloat(-0.01, 0.01);
  const powerSpectrum = Array.from({ length: 200 }, (_, i) => {
    const p = 0.5 + (i/200) * 30;
    let power = 5 + Math.random() * 5;
    if (Math.abs(p - blsPeriod) < 0.5) {
      power = 20 + Math.random() * 5 - (Math.abs(p-blsPeriod) * 20);
    }
    return { period: p, power };
  });

  const phaseFoldedLightCurve = Array.from({length: 300}, (_, i) => {
      const phase = (i / 300) * 1 - 0.5;
      let brightness = 1.0 + (Math.random() - 0.5) * 0.0008;
      if (Math.abs(phase) < (transitDuration / (period * 24)) / 2) {
          brightness -= transitDepth;
      }
      return { phase, brightness };
  });
  
  const transitFitModel = Array.from({ length: 100 }, (_, i) => {
      const phase = (i / 99) * 1 - 0.5;
      let brightness = 1.0;
       if (Math.abs(phase) < (transitDuration / (period * 24)) / 2) {
          brightness = 1.0 - transitDepth;
      }
      return { phase, brightness };
  }).sort((a, b) => a.phase - b.phase);


  const cnnProbs = [getRandomFloat(0.7, 0.98), getRandomFloat(0, 0.1), getRandomFloat(0, 0.1), getRandomFloat(0, 0.1)];
  const rfProbs = [cnnProbs[0] * 0.9, cnnProbs[1]*1.2, cnnProbs[2]*1.2, cnnProbs[3]*1.2];

  const inHabitableZone = temperature > 273 && temperature < 373 && radius > 0.8 && radius < 2.0;

  const researchSummary = `
### Methodology
The light curve for TIC ${ticId} was analyzed using a standard transit photometry pipeline. A Box Least Squares (BLS) algorithm was employed to search for periodic transit signals within a period range of 0.5 to 30 days. The detected signal was then vetted using a 1D Convolutional Neural Network (CNN) to classify its nature.

### Results
A significant transit signal was detected with a period of **${blsPeriod.toFixed(3)} ± ${getRandomFloat(0.001, 0.005, 4)} days** and a signal-to-noise ratio (SNR) of **${getRandomFloat(8, 25, 1)}**. The transit depth suggests a planet candidate with a radius of **${radius} ± ${getRandomFloat(0.05, 0.2, 2)} Earth radii**. Our machine learning classifier identified the signal as a **Planet Candidate** with 97.2% confidence.

### Significance
This finding represents a strong exoplanet candidate. Further follow-up observations are recommended to confirm its planetary nature and precisely measure its mass and atmospheric properties.
`;

 const researchAbstract = `
The TESS mission provides a vast dataset for exoplanet discovery. In this study, we analyze the light curve of the star TIC ${ticId} to search for transiting exoplanets. Our automated pipeline utilizes a Box Least Squares (BLS) algorithm to detect periodic dimming events. A promising signal was identified with a period of ${blsPeriod.toFixed(2)} days and a high signal-to-noise ratio. To validate the signal's origin, we employed a 1D Convolutional Neural Network (CNN), which classified the event as a 'Planet Candidate' with over 95% confidence, effectively ruling out common false positives like eclipsing binaries or stellar variability. Modeling the transit shape suggests the candidate has a radius of approximately ${radius} Earth radii. Based on its orbital distance from a ${getRandomFloat(4000, 6000, 0)}K star, the candidate is ${inHabitableZone ? 'located within the habitable zone' : 'not located within the habitable zone'}, warranting further investigation to characterize this potential new world. This work demonstrates the efficacy of combining algorithmic detection with machine learning validation in modern exoplanet surveys.
 `;

  return {
    ticId,
    planet: {
      name: `TIC ${ticId} b`,
      radius: { value: radius, uncertainty: getRandomFloat(0.05, 0.2, 2) },
      mass: { value: mass, uncertainty: getRandomFloat(0.1, 1, 2) },
      period: { value: period, uncertainty: getRandomFloat(0.001, 0.005, 4) },
      temperature,
    },
    star: {
      name: `TIC ${ticId}`,
      type: 'G-type main-sequence',
      apparentMagnitude: getRandomFloat(8, 15),
      distance: getRandomFloat(50, 2000),
    },
    lightCurve,
    radialVelocityCurve: Array.from({ length: 50 }, (_, i) => ({
        time: (i / 49) * period * 1.5,
        velocity: Math.sin((i / 49) * 2 * Math.PI) * (mass/radius) * 5 + (Math.random() - 0.5) * 2
    })),
    atmosphere: {
      pressure: getRandomFloat(0.5, 10),
      composition: [
        { chemical: 'Nitrogen', percentage: getRandomFloat(70, 80) },
        { chemical: 'Oxygen', percentage: getRandomFloat(10, 20) },
        { chemical: 'Water Vapor', percentage: getRandomFloat(0, 5) },
      ],
    },
    habitability: {
      score: inHabitableZone ? getRandomFloat(7.5, 9.5, 1) : getRandomFloat(1, 4, 1),
      inHabitableZone,
    },
    detection: {
      blsPeriod: { value: blsPeriod, uncertainty: getRandomFloat(0.001, 0.005, 4) },
      snr: getRandomFloat(8, 25, 1),
      powerSpectrum,
      phaseFoldedLightCurve,
      transitFitModel,
      transitFitParams: {
          depth: transitDepth,
          duration: transitDuration,
          impactParameter: getRandomFloat(0, 0.8),
          epoch: 2458845.345
      }
    },
    classification: {
      cnn: { bestGuess: 'Planet Candidate', predictions: [{ class: 'Planet Candidate', confidence: cnnProbs[0] }, { class: 'Eclipsing Binary', confidence: cnnProbs[1] }, { class: 'Stellar Variability', confidence: cnnProbs[2] }, { class: 'Noise', confidence: cnnProbs[3] }] },
      randomForest: { 
          bestGuess: 'Planet Candidate', 
          predictions: [{ class: 'Planet Candidate', confidence: rfProbs[0] }, { class: 'Eclipsing Binary', confidence: rfProbs[1] }, { class: 'Stellar Variability', confidence: rfProbs[2] }, { class: 'Noise', confidence: rfProbs[3] }],
          featureImportance: [
              { feature: 'depth', score: getRandomFloat(0.4, 0.6) },
              { feature: 'duration', score: getRandomFloat(0.2, 0.3) },
              { feature: 'snr', score: getRandomFloat(0.1, 0.2) },
              { feature: 'period', score: getRandomFloat(0.05, 0.1) },
          ]
      },
    },
    verification: {
        status: ticId.startsWith('mock') ? 'New Candidate' : 'Known Planet',
        knownName: ticId.startsWith('mock') ? undefined : `KOI-${getRandomFloat(100, 900, 0)}`,
        archiveUrl: `https://exofop.ipac.caltech.edu/tess/target.php?id=${ticId}`
    },
    researchSummary,
    researchAbstract,
  };
};
