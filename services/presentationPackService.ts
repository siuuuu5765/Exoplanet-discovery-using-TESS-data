// services/presentationPackService.ts
import pptxgen from "pptxgenjs";
import type { PlanetAnalysis } from '../types';

// FIX: Service to generate a PowerPoint presentation from the analysis results.

// Helper function to add a title and a content box to a slide
const addContentSlide = (
    pptx: pptxgen,
    title: string,
    content: (string | { text: string; options?: pptxgen.TextProps })[]
) => {
    const slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide.addText(title, {
        x: 0.5, y: 0.25, w: '90%', h: 0.75,
        fontSize: 24,
        bold: true,
        color: '00BFFF', // Deep Sky Blue
        align: 'center',
    });
    slide.addText(content, {
        x: 0.5, y: 1.2, w: '90%', h: '75%',
        fontSize: 14,
        bullet: true,
        color: 'F5F5F5' // White Smoke
    });
};

export const generatePresentation = (analysis: PlanetAnalysis) => {
    const pptx = new pptxgen();

    // Presentation properties
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'TESS Exoplanet Discovery Hub';
    pptx.company = 'ISEF 2024 Project';
    pptx.title = `Exoplanet Analysis Report: TIC ${analysis.ticId}`;
    
    // Slide master to define background
    pptx.defineSlideMaster({
        title: "MASTER_SLIDE",
        background: { color: "0c1a3e" }, // Dark blue background
    });

    // --- Title Slide ---
    const titleSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    titleSlide.addText(`Exoplanet Analysis Report`, {
        x: 0.5, y: 1.5, w: '90%', h: 1,
        fontSize: 44,
        bold: true,
        color: '00FFFF', // Cyan
        align: 'center'
    });
    titleSlide.addText(`TIC ${analysis.ticId}`, {
        x: 0.5, y: 2.5, w: '90%', h: 1,
        fontSize: 32,
        color: 'FFD700', // Gold
        align: 'center'
    });
    titleSlide.addText(`Generated: ${new Date().toLocaleDateString()}`, {
        x: 0.5, y: 5.0, w: '90%', h: 0.5,
        fontSize: 16,
        color: 'C0C0C0', // Silver
        align: 'center'
    });

    // --- System Overview Slide ---
    addContentSlide(pptx, "System Overview", [
        { text: `Star: ${analysis.star.name}`, options: { bold: true, color: 'FFD700' } },
        { text: `\tType: ${analysis.star.type}` },
        { text: `\tDistance: ${analysis.star.distance.toFixed(0)} light-years` },
        { text: `Planet Candidate: ${analysis.planet.name}`, options: { bold: true, color: '00FFFF', breakLine: true } },
        { text: `\tOrbital Period: ${analysis.planet.period.value.toFixed(3)} days` },
        { text: `\tRadius: ${analysis.planet.radius.value.toFixed(2)} Earth radii` },
        { text: `\tEstimated Temperature: ${analysis.planet.temperature} K` },
    ]);

    // --- ML Classification Slide ---
    addContentSlide(pptx, "Machine Learning Classification", [
        { text: `Primary Signal Classification (CNN):`, options: { bold: true } },
        { text: `\t${analysis.classification.cnn.bestGuess} (Confidence: ${(analysis.classification.cnn.predictions.find(p => p.class === analysis.classification.cnn.bestGuess)!.confidence * 100).toFixed(1)}%)` },
        { text: `Secondary Model (Random Forest):`, options: { bold: true, breakLine: true } },
        { text: `\t${analysis.classification.randomForest.bestGuess} (Confidence: ${(analysis.classification.randomForest.predictions.find(p => p.class === analysis.classification.randomForest.bestGuess)!.confidence * 100).toFixed(1)}%)` },
        { text: `This indicates a high probability that the detected signal is a genuine planetary candidate.`, options: { breakLine: true } },
    ]);

     // --- Habitability Slide ---
     addContentSlide(pptx, "Habitability Analysis", [
        { text: `Habitability Score: ${analysis.habitability.score.toFixed(1)} / 10`, options: { bold: true } },
        { text: `Located in Habitable Zone: ${analysis.habitability.inHabitableZone ? 'Yes' : 'No'}`, options: { bold: true, color: analysis.habitability.inHabitableZone ? '00FF00' : 'FF4500' } },
        { text: `Atmospheric Composition:`, options: { bold: true, breakLine: true } },
        ...(analysis.atmosphere?.composition.map(c => `\t- ${c.chemical}: ${c.percentage.toFixed(1)}%`) || ["\t- Data not available"]),
        { text: `Conclusion: The planet shows ${analysis.habitability.score > 7 ? 'promising' : (analysis.habitability.score > 4 ? 'moderate' : 'low')} signs of potential habitability.`, options: { breakLine: true } },
    ]);
    
    // --- Final Slide ---
    const finalSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    finalSlide.addText("TESS Exoplanet Discovery Hub", {
        x: 0, y: 3.0, w: '100%', h: 1,
        fontSize: 36,
        bold: true,
        color: '00BFFF',
        align: 'center'
    });

    pptx.writeFile({ fileName: `TESS_Presentation_TIC_${analysis.ticId}.pptx` });
};