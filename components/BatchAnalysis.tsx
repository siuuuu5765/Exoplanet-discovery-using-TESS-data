// components/BatchAnalysis.tsx
import React, { useState } from 'react';
import { CpuChipIcon } from './Icons';

interface BatchAnalysisProps {
    onRunBatch: (ticIds: string) => void;
    disabled: boolean;
    progress: string;
}

const BatchAnalysis: React.FC<BatchAnalysisProps> = ({ onRunBatch, disabled, progress }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [ticIdsInput, setTicIdsInput] = useState('');

    const handleRunClick = () => {
        onRunBatch(ticIdsInput);
    };

    return (
        <div className="bg-space-blue/30 p-4 rounded-lg border border-space-light/50 mt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-lg font-display text-accent-gold tracking-wider text-center mb-4 flex items-center justify-center"
            >
                <CpuChipIcon className="w-6 h-6 mr-3" />
                Batch Analysis
            </button>
            {isOpen && (
                <div className="animate-fade-in-down">
                    <p className="text-sm text-gray-400 mb-2">
                        Enter multiple TIC IDs (space or newline separated) for rapid classification.
                    </p>
                    <textarea
                        value={ticIdsInput}
                        onChange={(e) => setTicIdsInput(e.target.value)}
                        placeholder={"233544353\n200164267\n429375484"}
                        className="w-full h-32 bg-space-dark p-2 rounded-md border border-space-light focus:ring-2 focus:ring-accent-magenta outline-none"
                        disabled={disabled}
                    />
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            onClick={handleRunClick}
                            disabled={disabled || !ticIdsInput.trim()}
                            className="bg-accent-magenta text-white font-bold py-2 px-6 rounded-md hover:bg-accent-magenta/80 transition-colors disabled:opacity-50"
                        >
                            {disabled ? 'Running...' : 'Run Batch'}
                        </button>
                        {progress && <span className="text-accent-cyan font-mono">{progress}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchAnalysis;