// components/Sidebar.tsx
import React from 'react';
import type { BatchResult } from '../types';
import BatchResultsTable from './BatchResultsTable';

interface SidebarProps {
  batchTicIds: string;
  setBatchTicIds: (value: string) => void;
  onRunBatch: () => void;
  isBatchRunning: boolean;
  batchResults: BatchResult[];
}

const Sidebar: React.FC<SidebarProps> = ({ batchTicIds, setBatchTicIds, onRunBatch, isBatchRunning, batchResults }) => {
  return (
    <aside className="w-80 bg-space-blue/30 border-r border-space-light p-4 hidden md:flex flex-col">
      <h2 className="text-xl font-display text-accent-gold tracking-wider">Batch Analysis</h2>
      <p className="text-xs text-gray-400 mt-1 mb-4">Analyze multiple TIC IDs at once. Separate IDs with commas.</p>
      
      <textarea
        value={batchTicIds}
        onChange={(e) => setBatchTicIds(e.target.value)}
        rows={4}
        className="w-full bg-space-dark border border-space-light rounded-md p-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-magenta"
        placeholder="e.g., 307210830, 233544353"
        disabled={isBatchRunning}
      />
      
      <button
        onClick={onRunBatch}
        className="w-full mt-3 bg-accent-magenta text-white font-bold py-2 px-4 rounded-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
        disabled={isBatchRunning}
      >
        {isBatchRunning ? 'Running...' : 'Run Batch'}
      </button>

      <div className="mt-6 flex-1 overflow-y-auto">
        <h3 className="text-lg font-display text-accent-gold">Results</h3>
        <BatchResultsTable results={batchResults} />
      </div>
    </aside>
  );
};

export default Sidebar;
