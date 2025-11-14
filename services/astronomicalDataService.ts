// services/astronomicalDataService.ts

/**
 * Simulates fetching Gaia DR3 data for a given TIC ID.
 * In a real backend, this would query the Gaia archive.
 * Returns parallax in milliarcseconds (mas).
 */
export const fetchGaiaData = async (ticId: string): Promise<{ parallax_mas: number | null }> => {
    // Data hardcoded for key targets to simulate a real API response.
    const gaiaDatabase: { [key:string]: { parallax_mas: number } } = {
        '429375484': { parallax_mas: 768.52 }, // Proxima Centauri
        '233544353': { parallax_mas: 6.54 }, // Kepler-186
        '200164267': { parallax_mas: 81.3 }, // TRAPPIST-1
    };
    return { parallax_mas: gaiaDatabase[ticId]?.parallax_mas ?? null };
};

/**
 * Simulates fetching data from the MAST (Mikulski Archive for Space Telescopes) API.
 * In a real backend, this would query the TICv8+ catalog.
 */
export const fetchMASTData = async (ticId: string): Promise<any> => {
     const mastDatabase: { [key:string]: any } = {
        '429375484': { ra: 217.42895, dec: -62.67949, TESSMag: 11.13 },
        '233544353': { ra: 299.8588, dec: 48.232, TESSMag: 14.9 },
        '200164267': { ra: 346.626, dec: -5.041, TESSMag: 11.35 },
    };
    return mastDatabase[ticId] ?? {};
};


/**
 * Fetches and parses stellar parameters for a given TIC ID from the ExoFOP-TESS website.
 * This is a live fetch using CORS proxies.
 */
export const fetchExoFopData = async (ticId: string): Promise<{ data: any | null; error?: string; isInvalidTic?: boolean; }> => {
    const url = `https://exofop.ipac.caltech.edu/tess/target.php?id=${ticId}`;
    const proxies = ['https://api.allorigins.win/get?url=', 'https://corsproxy.io/?', 'https://cors.eu.org/'];

    for (const proxy of proxies) {
        try {
            const fullUrl = proxy.includes('allorigins') ? `${proxy}${encodeURIComponent(url)}` : `${proxy}${url}`;
            const response = await fetch(fullUrl, { signal: AbortSignal.timeout(15000) });

            if (!response.ok) throw new Error(`Proxy responded with status ${response.status}`);

            const htmlContent = proxy.includes('allorigins') ? (await response.json()).contents : await response.text();
            if (!htmlContent) throw new Error("Empty response from proxy.");

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            if (doc.title.includes("Error") || doc.body.textContent?.includes("not found in the TIC")) {
                return { data: null, isInvalidTic: true, error: `ExoFOP: TIC ${ticId} not found.` };
            }

            const parsedData: { [key: string]: string } = {};
            const tablesToParse = doc.querySelectorAll('table');

            tablesToParse.forEach(table => {
                table.querySelectorAll('tr').forEach(row => {
                    const cells = row.querySelectorAll('th, td');
                    if (cells.length >= 2) {
                        const key = cells[0].textContent?.trim().toLowerCase().replace(':', '') ?? '';
                        const valueCell = cells[1].cloneNode(true) as HTMLElement;
                        valueCell.querySelectorAll('sup, a').forEach(el => el.remove());
                        const value = valueCell.textContent?.trim() ?? '';
                        // Prioritize values with uncertainty, as they are often more precise.
                        if (key && value && (!parsedData[key] || value.includes('±'))) {
                            parsedData[key] = value;
                        }
                    }
                });
            });

            const getFloat = (keys: string[]): number | null => {
                for (const key of keys) {
                    const lowerKey = key.toLowerCase();
                    if (parsedData[lowerKey]) {
                         const num = parseFloat(parsedData[lowerKey].split(/[\s±~]/)[0]);
                         return isNaN(num) ? null : num;
                    }
                    for (const parsedKey in parsedData) {
                        if (parsedKey.includes(lowerKey)) {
                            const num = parseFloat(parsedData[parsedKey].split(/[\s±~]/)[0]);
                            return isNaN(num) ? null : num;
                        }
                    }
                }
                return null;
            };

            const profile = {
                Star_Name: doc.querySelector('h1')?.textContent?.split('(')[0].trim() || `TIC ${ticId}`,
                Temperature_K: getFloat(['teff (k)', 'teff']),
                Surface_Gravity_logg: getFloat(['log(g)', 'logg']),
                Radius_Rsun: getFloat(['radius (r_sun)', 'radius']),
                Mass_Msun: getFloat(['mass (m_sun)', 'mass']),
                Metallicity_FeH: getFloat(['metallicity', 'fe/h']),
                Luminosity_Lsun: getFloat(['luminosity (l_sun)', 'luminosity']),
            };
            
            return { data: profile };
        } catch (error) {
            console.warn(`ExoFOP fetch via ${proxy} failed:`, error);
        }
    }
    return { data: null, error: `Failed to fetch ExoFOP data for TIC ${ticId} via all proxies.` };
};


/**
 * Simulates fetching confirmed planet data from the NASA Exoplanet Archive.
 */
export const fetchNASAPlanetData = async (ticId: string): Promise<any> => {
    const nasaArchive: { [key:string]: any } = {
        '429375484': {
            Name: 'Proxima Cen b',
            Orbital_Period_days: 11.18,
            Planet_Radius_Rearth: 1.07,
            Planet_Mass_Mearth: 1.27,
            Equilibrium_Temperature_K: 234,
        },
        '233544353': {
            Name: 'Kepler-186 f',
            Orbital_Period_days: 129.94,
            Planet_Radius_Rearth: 1.17,
            Planet_Mass_Mearth: 1.4, // Estimated
            Equilibrium_Temperature_K: 188,
        },
        '200164267': {
            Name: 'TRAPPIST-1 e',
            Orbital_Period_days: 6.10,
            Planet_Radius_Rearth: 0.92,
            Planet_Mass_Mearth: 0.69,
            Equilibrium_Temperature_K: 251,
        },
    };
    return nasaArchive[ticId] ?? {};
};
