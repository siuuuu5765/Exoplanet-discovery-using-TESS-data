// components/ResearchSummary.tsx
import React from 'react';
import Markdown from 'react-markdown';
import { DocumentTextIcon } from './Icons';

interface ResearchSummaryProps {
  summary: string;
  abstract: string;
}

const ResearchSummary: React.FC<ResearchSummaryProps> = ({ summary, abstract }) => {
  return (
    <div className="space-y-6">
      {/* Research Abstract Card */}
      <div className="bg-space-blue/50 p-6 rounded-lg shadow-md border border-accent-gold/50 backdrop-blur-sm">
        <h3 className="text-lg font-bold font-display text-accent-gold mb-3 flex items-center">
          <DocumentTextIcon className="w-6 h-6 mr-2" />
          Research Abstract
        </h3>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
          <Markdown>{abstract}</Markdown>
        </div>
      </div>
      
      {/* Research Summary Card */}
      <div className="bg-space-blue/50 p-6 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
        <h3 className="text-lg font-bold font-display text-accent-cyan mb-3 flex items-center">
          <DocumentTextIcon className="w-6 h-6 mr-2" />
          Full Research Summary
        </h3>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
          <Markdown>{summary}</Markdown>
        </div>
      </div>
    </div>
  );
};

export default ResearchSummary;