
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
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        const canvasPdfWidth = pdfWidth;
        const canvasPdfHeight = canvasPdfWidth / ratio;
        
        let heightLeft = canvas.height * pdfWidth / canvas.width;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, heightLeft);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = position - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvas.height * pdfWidth / canvas.width);
            heightLeft -= pdfHeight;
        }

        pdf.save(`TESS_Report_TIC_${analysis.ticId}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
