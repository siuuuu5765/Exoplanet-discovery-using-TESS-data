// components/BatchResultsTable.tsx
import React from 'react';
import type { BatchResult } from '../types';

interface BatchResultsTableProps {
    results: BatchResult[];
}

const BatchResultsTable: React.FC<BatchResultsTableProps> = ({ results }) => {
    if (!results || results.length === 0) {
        return null;
    }

    return (
        <div className="bg-space-blue/30 p-4 rounded-lg border border-space-light/50 mt-8 animate-fade-in">
            <h3 className="text-lg font-display text-accent-gold tracking-wider text-center mb-4">
                Batch Analysis Results
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-gray-400">
                        <tr>
                            <th className="p-2 font-semibold">TIC ID</th>
                            <th className="p-2 font-semibold">Status</th>
                            <th className="p-2 font-semibold">Period (days)</th>
                            <th className="p-2 font-semibold">Radius (R⊕)</th>
                            <th className="p-2 font-semibold">Mass (M⊕)</th>
                            <th className="p-2 font-semibold">Temp (K)</th>
                            <th className="p-2 font-semibold">ML Classification</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((item, index) => (
                            <tr key={index} className="border-t border-space-light/50">
                                <td className="p-2 font-medium text-gray-200 font-mono">{item.ticId}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        item.status === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-2 font-mono">
                                    {item.status === 'success' && item.detection ? item.detection.blsPeriod.value.toFixed(4) : 'N/A'}
                                </td>
                                <td className="p-2 font-mono">
                                    {item.status === 'success' && item.planet ? item.planet.radius.value.toFixed(2) : 'N/A'}
                                </td>
                                <td className="p-2 font-mono">
                                    {item.status === 'success' && item.planet ? item.planet.mass.value.toFixed(2) : 'N/A'}
                                </td>
                                <td className="p-2 font-mono">
                                    {item.status === 'success' && item.planet ? item.planet.temperature.toFixed(0) : 'N/A'}
                                </td>
                                <td className="p-2">
                                    {item.status === 'success' && item.classification ? item.classification.cnn.bestGuess : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BatchResultsTable;