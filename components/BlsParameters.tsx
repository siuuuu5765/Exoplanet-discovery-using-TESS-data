// components/BlsParameters.tsx
import React, { useState } from 'react';
import { SlidersIcon } from './Icons';

interface BlsParametersProps {
    params: {
        periodRange: [number, number];
        snr: number;
        transitDepth: number;
    };
    onParamsChange: (newParams: BlsParametersProps['params']) => void;
    disabled: boolean;
}

const BlsParameters: React.FC<BlsParametersProps> = ({ params, onParamsChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleRangeChange = (index: 0 | 1, value: string) => {
        const newRange: [number, number] = [params.periodRange[0], params.periodRange[1]];
        newRange[index] = parseFloat(value) || 0;
        onParamsChange({ ...params, periodRange: newRange });
    };

    return (
        <div className="bg-space-blue/30 p-4 rounded-lg border border-space-light/50 mt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-lg font-display text-accent-gold tracking-wider text-center flex items-center justify-center"
            >
                <SlidersIcon className="w-6 h-6 mr-3" />
                Advanced Analysis Parameters
            </button>
            {isOpen && (
                <div className="animate-fade-in-down mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <label className="block text-gray-400 mb-1">Period Range (days)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={params.periodRange[0]}
                                onChange={(e) => handleRangeChange(0, e.target.value)}
                                className="w-full bg-space-dark p-2 rounded-md border border-space-light focus:ring-2 focus:ring-accent-magenta outline-none"
                                disabled={disabled}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                value={params.periodRange[1]}
                                onChange={(e) => handleRangeChange(1, e.target.value)}
                                className="w-full bg-space-dark p-2 rounded-md border border-space-light focus:ring-2 focus:ring-accent-magenta outline-none"
                                disabled={disabled}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="snr" className="block text-gray-400 mb-1">Min. Signal-to-Noise (SNR)</label>
                        <input
                            id="snr"
                            type="number"
                            value={params.snr}
                            onChange={(e) => onParamsChange({ ...params, snr: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-space-dark p-2 rounded-md border border-space-light focus:ring-2 focus:ring-accent-magenta outline-none"
                            disabled={disabled}
                        />
                    </div>
                    <div>
                        <label htmlFor="depth" className="block text-gray-400 mb-1">Min. Transit Depth (ppm)</label>
                        <input
                            id="depth"
                            type="number"
                            value={params.transitDepth}
                            onChange={(e) => onParamsChange({ ...params, transitDepth: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-space-dark p-2 rounded-md border border-space-light focus:ring-2 focus:ring-accent-magenta outline-none"
                            disabled={disabled}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlsParameters;