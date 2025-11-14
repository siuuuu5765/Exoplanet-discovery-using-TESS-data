// services/reportGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to add a canvas image to the PDF, handling page breaks
const addImageToPdf = (doc: jsPDF, canvas: HTMLCanvasElement, yCursor: number): number => {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgProps = doc.getImageProperties(imgData);
    const margin = 15;
    const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const pageHeight = doc.internal.pageSize.getHeight() - margin;

    let finalY = yCursor;
    if (finalY + pdfHeight > pageHeight) {
        doc.addPage();
        finalY = margin;
    }
    
    doc.addImage(imgData, 'PNG', margin, finalY, pdfWidth, pdfHeight);
    return finalY + pdfHeight + 10; // return new y position with some padding
};


export const generatePdfReport = async (ticId: string): Promise<void> => {
    const profileElement = document.getElementById('profile-section');
    const tabContentElement = document.getElementById('tab-content-section');

    if (!profileElement || !tabContentElement) {
        console.error("Required elements for PDF generation not found.");
        alert("Could not generate report. Required content is missing from the page.");
        return;
    }
    
    // A4 page is 210mm x 297mm
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    let yCursor = margin;

    try {
        // --- Title Page ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor('#00ffff'); // accent-cyan
        doc.text('Exoplanet Analysis Report', doc.internal.pageSize.getWidth() / 2, yCursor, { align: 'center' });
        
        yCursor += 15;
        doc.setFontSize(18);
        doc.setTextColor('#f0f9ff'); // text-gray-50
        doc.text(`Target: TIC ${ticId}`, doc.internal.pageSize.getWidth() / 2, yCursor, { align: 'center' });
        
        yCursor += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#d1d5db'); // text-gray-300
        doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, yCursor, { align: 'center' });
        doc.text('TESS Exoplanet Discovery Hub', doc.internal.pageSize.getWidth() / 2, yCursor + 5, { align: 'center' });
        
        doc.addPage();
        yCursor = margin;
        
        // --- System Profile Section ---
        doc.setFontSize(16);
        doc.setTextColor('#00ffff');
        doc.text('System Profile & Visualization', margin, yCursor);
        yCursor += 8;

        const profileCanvas = await html2canvas(profileElement, {
            backgroundColor: '#0c1a3e',
            scale: 2,
            useCORS: true
        });
        yCursor = addImageToPdf(doc, profileCanvas, yCursor);

        // --- Active Analysis Tab Section ---
        const activeTabButton = document.querySelector('button[class*="border-accent-cyan"]');
        const tabTitle = activeTabButton?.textContent || "Analysis Details";

        // Check if a new page is needed before adding the next section title
        if (yCursor + 20 > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yCursor = margin;
        }

        doc.setFontSize(16);
        doc.setTextColor('#00ffff');
        doc.text(tabTitle, margin, yCursor);
        yCursor += 8;
        
        const tabContentCanvas = await html2canvas(tabContentElement, {
            backgroundColor: '#0c1a3e',
            scale: 2,
            useCORS: true
        });
        addImageToPdf(doc, tabContentCanvas, yCursor);

        doc.save(`TESS-Report-TIC-${ticId}.pdf`);
    } catch (error) {
        console.error("Error generating PDF report:", error);
        alert("An error occurred while generating the PDF report. Please check the console for details.");
    }
};
