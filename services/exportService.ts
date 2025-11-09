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
    const { planet, star, detection, classification, habitability, research, lightCurve } = analysis;
    
    // Use an array of objects for easier processing and CSV conversion
    const dataRows: { category: string, parameter: string, value: string | number, details?: string | number }[] = [];

    // Planet Data
    dataRows.push({ category: 'planet', parameter: 'name', value: planet.name });
    dataRows.push({ category: 'planet', parameter: 'period_days', value: planet.period.value, details: planet.period.uncertainty });
    dataRows.push({ category: 'planet', parameter: 'radius_earth', value: planet.radius.value, details: planet.radius.uncertainty });
    dataRows.push({ category: 'planet', parameter: 'mass_earth', value: planet.mass.value, details: planet.mass.uncertainty });
    dataRows.push({ category: 'planet', parameter: 'temperature_k', value: planet.temperature });

    // Star Data
    dataRows.push({ category: 'star', parameter: 'name', value: star.name });
    dataRows.push({ category: 'star', parameter: 'type', value: star.type });
    dataRows.push({ category: 'star', parameter: 'apparent_magnitude', value: star.apparentMagnitude });
    dataRows.push({ category: 'star', parameter: 'distance_light_years', value: star.distance });

    // Detection Data (Light Curve Summary)
    dataRows.push({ category: 'detection_summary', parameter: 'bls_period_days', value: detection.blsPeriod.value, details: detection.blsPeriod.uncertainty });
    dataRows.push({ category: 'detection_summary', parameter: 'transit_depth_percent', value: (detection.transitFitParameters.depth * 100).toFixed(4) });
    dataRows.push({ category: 'detection_summary', parameter: 'transit_duration_hours', value: detection.transitFitParameters.duration.toFixed(3) });
    dataRows.push({ category: 'detection_summary', parameter: 'epoch_bjd', value: detection.transitFitParameters.epoch.toFixed(5) });

    // ML Classification - CNN
    dataRows.push({ category: 'ml_classification_cnn', parameter: 'best_guess', value: classification.cnn.bestGuess });
    classification.cnn.predictions.forEach(p => {
        dataRows.push({ category: 'ml_classification_cnn', parameter: p.class, value: (p.confidence * 100).toFixed(2) });
    });

    // ML Classification - Random Forest
    dataRows.push({ category: 'ml_classification_rf', parameter: 'best_guess', value: classification.randomForest.bestGuess });
    classification.randomForest.predictions.forEach(p => {
        dataRows.push({ category: 'ml_classification_rf', parameter: p.class, value: (p.confidence * 100).toFixed(2) });
    });

    // Habitability Summary
    dataRows.push({ category: 'habitability', parameter: 'classification', value: habitability.classification });
    dataRows.push({ category: 'habitability', parameter: 'score', value: habitability.score.toFixed(2) });
    dataRows.push({ category: 'habitability', parameter: 'in_habitable_zone', value: habitability.inHabitableZone.toString() });
    // Sanitize reasoning text for CSV by escaping double quotes and wrapping in double quotes
    const sanitizedReasoning = `"${habitability.reasoning.replace(/"/g, '""')}"`;
    dataRows.push({ category: 'habitability', parameter: 'reasoning', value: sanitizedReasoning });
    
    // Research Abstract & Summary
    const sanitizedAbstract = `"${research.abstract.replace(/"/g, '""')}"`;
    const sanitizedSummary = `"${research.summary.replace(/"/g, '""')}"`;
    dataRows.push({ category: 'research', parameter: 'abstract', value: sanitizedAbstract });
    dataRows.push({ category: 'research', parameter: 'summary', value: sanitizedSummary });

    // Convert array of objects to CSV string
    const headers = ['category', 'parameter', 'value', 'details_or_uncertainty'];
    let csvContent = headers.join(',') + '\n';
    
    dataRows.forEach(row => {
        const line = [row.category, row.parameter, row.value, row.details ?? ''].join(',');
        csvContent += line + '\n';
    });

    // Add a sample of light curve data at the end
    if (lightCurve && lightCurve.length > 0) {
        csvContent += '\nlight_curve_sample,time_hours,brightness\n';
        lightCurve.slice(0, 20).forEach(p => {
            csvContent += `light_curve_sample,${p.time},${p.brightness}\n`;
        });
    }

    return csvContent;
};


export const exportAnalysisToCSV = (analysis: PlanetAnalysis) => {
    const csvString = convertToCSV(analysis);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8,' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TESS_Analysis_TIC_${analysis.ticId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
