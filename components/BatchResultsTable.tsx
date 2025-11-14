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

    const renderValue = (value: string | number) => {
        if (typeof value === 'number') return value.toFixed(3);
        return value;
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
                            <th className="p-2 font-semibold">Star Name</th>
                            <th className="p-2 font-semibold">Distance (ly)</th>
                            <th className="p-2 font-semibold">Planet Period (d)</th>
                            <th className="p-2 font-semibold">Planet Radius (R⊕)</th>
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
                                <td className="p-2">{item.profile ? renderValue(item.profile.Star.Name) : 'N/A'}</td>
                                <td className="p-2 font-mono">{item.profile ? renderValue(item.profile.Star.Distance_ly) : 'N/A'}</td>
                                <td className="p-2 font-mono">{item.profile ? renderValue(item.profile.Planet.Orbital_Period_days) : 'N/A'}</td>
                                <td className="p-2 font-mono">{item.profile ? renderValue(item.profile.Planet.Planet_Radius_Rearth) : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BatchResultsTable;
