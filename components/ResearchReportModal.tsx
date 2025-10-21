// components/ResearchReportModal.tsx
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { CloseIcon } from './Icons';

interface ResearchReportModalProps {
    reportMarkdown: string;
    onClose: () => void;
}

const ResearchReportModal: React.FC<ResearchReportModalProps> = ({ reportMarkdown, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

    const handleCopy = () => {
        navigator.clipboard.writeText(reportMarkdown);
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-space-dark border border-space-light rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <header className="flex items-center justify-between p-4 border-b border-space-light">
                    <h2 className="text-xl font-display text-accent-cyan">Generated Research Report</h2>
                    <div className="space-x-2">
                         <button onClick={handleCopy} className="bg-accent-cyan text-space-dark font-semibold py-2 px-4 rounded-md text-sm">
                            {copyButtonText}
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-space-light">
                            <CloseIcon className="w-6 h-6 text-gray-300" />
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                        <Markdown>{reportMarkdown}</Markdown>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ResearchReportModal;
