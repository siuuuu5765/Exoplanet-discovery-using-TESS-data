// services/systemProfileService.ts
import type { VerifiedSystemProfile } from '../types';
import { 
    fetchGaiaData, 
    fetchMASTData, 
    fetchExoFopData, 
    fetchNASAPlanetData 
} from './astronomicalDataService';


/**
 * Computes distance in light-years from Gaia DR3 parallax data.
 * Adheres to the critical rule: this is the ONLY source for distance.
 * @param parallax_mas Parallax in milliarcseconds.
 * @returns The distance in light-years, or null if parallax is invalid.
 */
const computeDistanceFromGaia = (parallax_mas: number | null): number | null => {
    if (parallax_mas === null || parallax_mas <= 0) {
        return null;
    }
    const parallax_arcsec = parallax_mas / 1000;
    const distance_pc = 1 / parallax_arcsec;
    const distance_ly = distance_pc * 3.26156;
    return parseFloat(distance_ly.toFixed(2));
};


/**
 * Creates an empty, default SystemProfile object for a given TIC ID.
 * This serves as the base structure to be populated.
 */
const createEmptyProfile = (ticId: string): VerifiedSystemProfile => ({
  TIC_ID: ticId,
  Star: {
    Name: 'Not Available',
    Distance_ly: 'Not Available',
    Apparent_Magnitude: 'Not Available',
    Temperature_K: 'Not Available',
    Radius_Rsun: 'Not Available',
    Mass_Msun: 'Not Available',
    Luminosity_Lsun: 'Not Available',
    Surface_Gravity_logg: 'Not Available',
    Metallicity_FeH: 'Not Available',
    Coordinates: {
      RA_deg: 'Not Available',
      Dec_deg: 'Not Available'
    }
  },
  Planet: {
    Name: 'Not Available',
    Orbital_Period_days: 'Not Available',
    Planet_Radius_Rearth: 'Not Available',
    Planet_Mass_Mearth: 'Not Available',
    Equilibrium_Temperature_K: 'Not Available'
  },
  Source: {
    Distance: 'Not Available',
    Other_Stellar_Params: 'Not Available',
    Planet_Params: 'Not Available'
  }
});

/**
 * Merges data from all sources into a single profile based on strict priority rules.
 */
const mergeDataPriority = (
    ticId: string,
    gaia: any,
    mast: any,
    exofop: any,
    nasa: any
): VerifiedSystemProfile => {
    const profile = createEmptyProfile(ticId);
    
    // 1. Gaia for Distance (Absolute Priority)
    const distanceLy = computeDistanceFromGaia(gaia.parallax_mas);
    if (distanceLy !== null) {
        profile.Star.Distance_ly = distanceLy;
        profile.Source.Distance = 'Gaia DR3';
    }

    // 2. MAST for basic coordinates and magnitude
    if (mast.ra) profile.Star.Coordinates.RA_deg = mast.ra;
    if (mast.dec) profile.Star.Coordinates.Dec_deg = mast.dec;
    if (mast.TESSMag) profile.Star.Apparent_Magnitude = mast.TESSMag;
    
    // 3. ExoFOP for Stellar Parameters
    if (exofop) {
        profile.Source.Other_Stellar_Params = 'ExoFOP-TESS';
        if (exofop.Star_Name) profile.Star.Name = exofop.Star_Name;
        if (exofop.Temperature_K) profile.Star.Temperature_K = exofop.Temperature_K;
        if (exofop.Radius_Rsun) profile.Star.Radius_Rsun = exofop.Radius_Rsun;
        if (exofop.Mass_Msun) profile.Star.Mass_Msun = exofop.Mass_Msun;
        if (exofop.Luminosity_Lsun) profile.Star.Luminosity_Lsun = exofop.Luminosity_Lsun;
        if (exofop.Surface_Gravity_logg) profile.Star.Surface_Gravity_logg = exofop.Surface_Gravity_logg;
        if (exofop.Metallicity_FeH) profile.Star.Metallicity_FeH = exofop.Metallicity_FeH;
    }
    
    // 4. NASA Exoplanet Archive for Planet Parameters (Overrides ExoFOP for planets)
    if (nasa && Object.keys(nasa).length > 0) {
        profile.Source.Planet_Params = 'NASA Exoplanet Archive';
        if (nasa.Name) profile.Planet.Name = nasa.Name;
        if (nasa.Orbital_Period_days) profile.Planet.Orbital_Period_days = nasa.Orbital_Period_days;
        if (nasa.Planet_Radius_Rearth) profile.Planet.Planet_Radius_Rearth = nasa.Planet_Radius_Rearth;
        if (nasa.Planet_Mass_Mearth) profile.Planet.Planet_Mass_Mearth = nasa.Planet_Mass_Mearth;
        if (nasa.Equilibrium_Temperature_K) profile.Planet.Equilibrium_Temperature_K = nasa.Equilibrium_Temperature_K;
    }

    // Final check for star name if still unavailable
    if (profile.Star.Name === 'Not Available' && profile.Planet.Name !== 'Not Available') {
      profile.Star.Name = (profile.Planet.Name as string).replace(/ [b-z]$/, '');
    } else if (profile.Star.Name === 'Not Available') {
      profile.Star.Name = `TIC ${ticId}`;
    }

    return profile;
};

/**
 * The main orchestrator for fetching a system profile. It fetches from all
 * designated sources and then merges the data according to priority.
 * @param ticId The TESS Input Catalog ID.
 * @returns A promise that resolves to a complete, verified SystemProfile object.
 */
export const getSystemProfile = async (ticId: string): Promise<VerifiedSystemProfile> => {
    // Fetch from all sources in parallel
    const [
        gaiaData,
        mastData,
        exoFopResult,
        nasaPlanetData,
    ] = await Promise.all([
        fetchGaiaData(ticId),
        fetchMASTData(ticId),
        fetchExoFopData(ticId),
        fetchNASAPlanetData(ticId),
    ]);

    if (exoFopResult.isInvalidTic) {
      const emptyProfile = createEmptyProfile(ticId);
      emptyProfile.Star.Name = `INVALID TIC ID`;
      return emptyProfile;
    }

    // Merge the data according to the specified priority rules
    const finalProfile = mergeDataPriority(
        ticId,
        gaiaData,
        mastData,
        exoFopResult.data,
        nasaPlanetData
    );

    return finalProfile;
};
