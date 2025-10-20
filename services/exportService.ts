
// services/exportService.ts
import type { PlanetAnalysis } from '../types';

// FIX: Service for exporting analysis data to various formats like JSON and CSV.
export const exportAnalysisToJSON = (analysis: PlanetAnalysis) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analysis, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `TESS_Analysis_TIC_${analysis.ticId}.json`;
    link.click();
};

const convertToCSV = (analysis: PlanetAnalysis): string => {
    const headers = ['category', 'parameter', 'value', 'uncertainty'];
    const rows: (string|number)[][] = [];
    
    // Planet Data
    rows.push(['planet', 'name', analysis.planet.name, '']);
    rows.push(['planet', 'radius_earth', analysis.planet.radius.value, analysis.planet.radius.uncertainty]);
    rows.push(['planet', 'period_days', analysis.planet.period.value, analysis.planet.period.uncertainty]);
    rows.push(['planet', 'mass_earth', analysis.planet.mass.value, analysis.planet.mass.uncertainty]);
    rows.push(['planet', 'temperature_k', analysis.planet.temperature, '']);
    
    // Star Data
    rows.push(['star', 'name', analysis.star.name, '']);
    rows.push(['star', 'type', analysis.star.type, '']);
    rows.push(['star', 'magnitude', analysis.star.apparentMagnitude, '']);
    rows.push(['star', 'distance_ly', analysis.star.distance, '']);
    
    // Light curve data (sample)
    rows.push(['light_curve_sample', 'time_hours', 'brightness', '']);
    analysis.lightCurve.slice(0, 10).forEach(p => {
        rows.push(['light_curve_sample', p.time, p.brightness, '']);
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
};

export const exportAnalysisToCSV = (analysis: PlanetAnalysis) => {
    const csvString = convertToCSV(analysis);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-t-8,' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TESS_Analysis_TIC_${analysis.ticId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
