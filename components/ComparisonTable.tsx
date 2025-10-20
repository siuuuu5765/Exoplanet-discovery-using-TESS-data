
// components/ComparisonTable.tsx
import React from 'react';
import type { ComparisonData } from '../types';
import { BeakerIcon } from './Icons'; // Re-using an icon

interface ComparisonTableProps {
  data: ComparisonData[];
}

// FIX: A component to display a side-by-side comparison of data from different sources.
const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">
        Data Source Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-gray-400">
            <tr>
              <th className="p-2 font-semibold">Parameter</th>
              <th className="p-2 font-semibold">Value</th>
              <th className="p-2 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-t border-space-light/50">
                <td className="p-2 font-medium text-gray-200">{item.property}</td>
                <td className="p-2 font-mono">{item.value}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.source === 'Gemini' ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-accent-gold/20 text-accent-gold'}`}>
                    {item.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
