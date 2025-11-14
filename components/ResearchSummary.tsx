// components/ResearchSummary.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BeakerIcon } from './Icons';

interface ResearchSummaryProps {
    summary: string;
}

const ResearchSummary: React.FC<ResearchSummaryProps> = ({ summary }) => {
    return (
        <div className="animate-fade-in bg-space-dark/30 p-6 rounded-lg border border-space-light/50">
            <h3 className="font-display text-accent-gold text-xl flex items-center mb-4">
                <BeakerIcon className="w-6 h-6 mr-3" />
                Proposed Follow-Up Research
            </h3>
            <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
        </div>
    );
};

export default ResearchSummary;
