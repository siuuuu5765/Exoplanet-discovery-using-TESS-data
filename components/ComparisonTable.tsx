// components/ComparisonTable.tsx
import React from 'react';
import type { ComparisonData } from '../types';

interface ComparisonTableProps {
    data: ComparisonData[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return null;
    }
    return (
        <div className="bg-space-dark/30 p-4 rounded-md border border-space-light/50">
            <h4 className="font-display text-accent-gold text-lg mb-3 text-center">
                Solar System Comparison
            </h4>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-gray-400">
                        <tr>
                            <th className="p-2 font-semibold">Parameter</th>
                            <th className="p-2 font-semibold text-center">Candidate</th>
                            <th className="p-2 font-semibold text-center">Earth</th>
                            <th className="p-2 font-semibold text-center">Jupiter</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200">
                        {data.map((item, index) => (
                            <tr key={index} className="border-t border-space-light/50">
                                <td className="p-2 font-medium">{item.parameter}</td>
                                <td className="p-2 font-mono text-center text-accent-cyan">{item.candidate}</td>
                                <td className="p-2 font-mono text-center">{item.earth}</td>
                                <td className="p-2 font-mono text-center">{item.jupiter}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonTable;
