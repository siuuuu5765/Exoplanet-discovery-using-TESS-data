// components/BlsParameters.tsx

import React, { useState } from 'react';
// FIX: Corrected import path for type definition
import type { BlsParameters } from '../types';
// FIX: Corrected import path for Icons component
import { SlidersIcon } from './Icons';

interface BlsParametersProps {
  params: BlsParameters;
  setParams: React.Dispatch<React.SetStateAction<BlsParameters>>;
  disabled: boolean;
}

const BlsParametersComponent: React.FC<BlsParametersProps> = ({ params, setParams, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const value = parseFloat(e.target.value);
    const newRange = [...params.periodRange] as [number, number];
    newRange[index] = value;
    if (newRange[0] > newRange[1]) {
        if (index === 0) newRange[1] = newRange[0];
        else newRange[0] = newRange[1];
    }
    setParams(prev => ({ ...prev, periodRange: newRange }));
  };

  return (
    <div className="max-w-xl mx-auto mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-center text-sm font-semibold text-gray-400 hover:text-white transition-colors py-2"
      >
        <SlidersIcon className="w-5 h-5 mr-2" />
        {isOpen ? 'Hide' : 'Show'} Advanced Analysis Parameters
      </button>
      {isOpen && (
        <div className="bg-space-blue/50 p-4 rounded-lg mt-2 border border-space-light animate-fade-in-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Period Range (days)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={params.periodRange[0]}
                  onChange={e => handleRangeChange(e, 0)}
                  className="w-full bg-space-dark text-center p-1 rounded border border-space-light"
                  disabled={disabled}
                  min="0.1"
                  step="0.1"
                />
                <span>-</span>
                <input 
                  type="number" 
                  value={params.periodRange[1]}
                  onChange={e => handleRangeChange(e, 1)}
                  className="w-full bg-space-dark text-center p-1 rounded border border-space-light"
                  disabled={disabled}
                  min={params.periodRange[0]}
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Depth Threshold (%)</label>
              <input 
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={params.depthThreshold * 100}
                onChange={e => setParams(p => ({...p, depthThreshold: parseFloat(e.target.value) / 100}))}
                className="w-full"
                disabled={disabled}
              />
              <div className="text-center text-gray-400">{(params.depthThreshold * 100).toFixed(1)}%</div>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">SNR Cutoff</label>
              <input 
                type="range"
                min="3"
                max="20"
                step="0.5"
                value={params.snrCutoff}
                onChange={e => setParams(p => ({...p, snrCutoff: parseFloat(e.target.value)}))}
                className="w-full"
                disabled={disabled}
              />
              <div className="text-center text-gray-400">{params.snrCutoff.toFixed(1)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlsParametersComponent;