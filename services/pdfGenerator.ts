// services/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { PlanetAnalysis } from '../types';

// FIX: Service to generate a PDF report from the analysis results.
export const generatePdfReport = async (analysis: PlanetAnalysis): Promise<void> => {
    const reportElement = document.getElementById('analysis-report');
    if (!reportElement) {
        console.error('Could not find report element to generate PDF.');
        return;
    }

    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2, // Higher scale for better quality
            backgroundColor: '#0c1a3e', // Match app background
            useCORS: true, 
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const contentStartY = 15; // Start content 15mm from top to leave space for header

        // Add custom header to the first page
        pdf.setFontSize(10);
        pdf.setTextColor('#00ffff'); // accent-cyan
        pdf.text('TESS Exoplanet Discovery Report — Generated via AI Studio', pdfWidth / 2, 10, { align: 'center' });
        pdf.setDrawColor('#475569'); // space-light
        pdf.line(10, 12, pdfWidth - 10, 12); // A line under the header

        const totalImageHeightInMM = canvas.height * pdfWidth / canvas.width;
        let imageRenderedHeight = 0; // Tracks how much of the image we've already "printed"

        // Add the first page of the image, starting below the header
        pdf.addImage(imgData, 'PNG', 0, contentStartY, pdfWidth, totalImageHeightInMM);
        imageRenderedHeight += (pdfHeight - contentStartY); // We used this much of the PDF page for the image

        // Loop and add subsequent pages if the image is taller than what fits on the first page
        while (imageRenderedHeight < totalImageHeightInMM) {
            pdf.addPage();
            // The position parameter shifts the source image up by the height we've already rendered
            pdf.addImage(imgData, 'PNG', 0, -imageRenderedHeight, pdfWidth, totalImageHeightInMM);
            imageRenderedHeight += pdfHeight;
        }

        pdf.save(`TESS_Report_TIC_${analysis.ticId}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
