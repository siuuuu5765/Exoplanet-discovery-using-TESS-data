// services/reportGenerator.ts
import type { PlanetAnalysis } from '../types';

/**
 * Generates a research paper-style report in Markdown format.
 * @param analysis - The PlanetAnalysis object containing all the data.
 * @returns A string containing the formatted Markdown report.
 */
export const generateResearchReport = (analysis: PlanetAnalysis): string => {
    const { ticId, planet, star, detection, classification, research, habitability } = analysis;

    const period = planet.period.value;
    const radius = planet.radius.value;
    const depth = detection.transitFitParameters.depth;
    const duration = detection.transitFitParameters.duration;
    const bestGuess = classification.cnn.bestGuess;
    const confidence = classification.cnn.predictions.find(p => p.class === bestGuess)?.confidence ?? 0;

    return `
# Detection and Characterization of an Exoplanet Candidate Orbiting TIC ${ticId} Using TESS Light Curve Data

**Authors:** Exoplanet Discovery AI System (Developed by Namann Alwaikar)

---

## Abstract

We report the discovery and analysis of a new exoplanet candidate, designated ${planet.name}, transiting the ${star.type} star TIC ${ticId}. The candidate was identified from photometric data collected by the Transiting Exoplanet Survey Satellite (TESS). A comprehensive analysis of the light curve was performed using a Box-Least-Squares (BLS) algorithm, revealing a periodic transit signal with a period of ${period.toFixed(4)} days and a duration of ${duration.toFixed(2)} hours. The observed transit depth of ${(depth * 100).toFixed(3)}% suggests a planetary radius of approximately ${radius.toFixed(2)} R⊕. AI-assisted vetting using a 1D Convolutional Neural Network (CNN) classifies the signal as a '${bestGuess}' with a high confidence of ${(confidence * 100).toFixed(1)}%, strongly supporting its planetary nature. This report details the methodology, results, and discussion of the candidate's characteristics.

---

## 1. Introduction

The Transiting Exoplanet Survey Satellite (TESS) mission (Ricker et al., 2015) is an all-sky survey designed to discover thousands of exoplanets around nearby bright stars. Its primary goal is to identify small planets with radii suitable for follow-up characterization of their atmospheres and masses. The mission utilizes transit photometry, a method that detects the minute dimming of a star's light as an orbiting planet passes in front of it. The characteristics of this dimming—its depth, duration, and periodicity—allow for the determination of the planet's size, orbital period, and other key parameters. The discovery of new worlds, particularly those within the habitable zones of their host stars, is crucial for advancing our understanding of planet formation, evolution, and the potential for life beyond Earth.

---

## 2. Methodology

The data for this study was acquired from the Mikulski Archive for Space Telescopes (MAST) by querying for the TESS Input Catalog ID: ${ticId}. The raw light curve, consisting of brightness measurements over time, was preprocessed to remove systematic trends and stellar variability using a Savitzky-Golay filter.

The detrended light curve was then subjected to a Box-Least-Squares (BLS) analysis (Kovács, Zucker, & Mazeh, 2002) to search for periodic transit-like signals. The algorithm identified a significant signal corresponding to the orbital period of the candidate. The light curve was subsequently phase-folded to this period to produce a high signal-to-noise ratio depiction of the transit event. A transit model was fitted to the phase-folded data to refine parameters such as transit depth (δ), duration (T_dur), and impact parameter (b). Finally, the signal was vetted using a pre-trained 1D Convolutional Neural Network to classify its nature and provide a confidence score.

---

## 3. Results

The analysis of the TESS light curve for TIC ${ticId} yielded a robust detection of a transit signal. The derived parameters for the candidate are as follows:

- **Orbital Period (P):** ${period.toFixed(4)} ± ${planet.period.uncertainty.toFixed(5)} days
- **Transit Duration (T_dur):** ${duration.toFixed(2)} hours
- **Transit Depth (δ):** ${(depth * 100).toFixed(3)}%
- **Derived Planetary Radius (R_p):** ${radius.toFixed(2)} ± ${planet.radius.uncertainty.toFixed(3)} R⊕

The relationship between transit depth and the radii of the planet (R_p) and star (R_*) is approximated by δ ≈ (R_p / R_*)². Our derived radius is based on this relationship and the catalogued stellar radius for TIC ${ticId}.

The AI-assisted classification resulted in a primary classification of **'${bestGuess}'** with a confidence level of **${(confidence * 100).toFixed(1)}%**. This high level of confidence significantly reduces the likelihood of the signal being a false positive, such as an eclipsing binary or instrumental noise.

---

## 4. Discussion

The derived physical parameters place ${planet.name} in the category of a Super-Earth or mini-Neptune. With a radius of ${radius.toFixed(2)} R⊕, it is a compelling target for further investigation. Its orbital period of ${period.toFixed(4)} days results in an estimated equilibrium temperature of ${planet.temperature} K, assuming zero albedo.

The habitability assessment (${habitability.reasoning}) suggests that its potential for supporting life as we know it is ${habitability.score > 7 ? 'promising' : (habitability.score > 4 ? 'moderate' : 'low')}. Its position relative to the stellar habitable zone is a key factor in this assessment. The simulated atmospheric composition provides a theoretical basis for what future spectroscopic observations might find.

---

## 5. Conclusion

We have presented a detailed analysis of TESS photometric data for TIC ${ticId}, leading to the identification of a strong exoplanet candidate, ${planet.name}. The candidate has a well-defined orbital period and a radius of ${radius.toFixed(2)} R⊕. The signal has been thoroughly vetted by our AI classification system, confirming its high likelihood of being planetary in nature.

To confirm the planetary status and accurately determine its mass and density, follow-up observations are essential. Radial velocity measurements using ground-based spectrographs would be the next logical step to measure the gravitational "wobble" induced on the host star. Furthermore, should the candidate be confirmed, its atmosphere could be a prime target for characterization with advanced instruments like the James Webb Space Telescope (JWST), which could search for biosignatures.

---

## References

1.  Ricker, G. R., et al. (2015). "Transiting Exoplanet Survey Satellite (TESS)". *Journal of Astronomical Telescopes, Instruments, and Systems*, 1(1), 014003.
2.  Kovács, G., Zucker, S., & Mazeh, T. (2002). "A box-fitting algorithm in the search for periodic transits". *Astronomy & Astrophysics*, 391(1), 369-377.
3.  Lightkurve Collaboration. (2018). "Lightkurve: Kepler and TESS time series analysis in Python". Astrophysics Source Code Library, ascl:1812.013.
4.  Mikulski Archive for Space Telescopes (MAST). STScI/NASA, retrieved from https://archive.stsci.edu/
    `;
};