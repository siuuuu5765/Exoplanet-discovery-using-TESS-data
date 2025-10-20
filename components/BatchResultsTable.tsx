
// components/BatchResultsTable.tsx
import React from 'react';
import type { BatchResult } from '../types';

interface BatchResultsTableProps {
  results: BatchResult[];
}

const BatchResultsTable: React.FC<BatchResultsTableProps> = ({ results }) => {
  if (results.length === 0) {
    return <p className="text-sm text-gray-500 mt-2">No batch results yet.</p>;
  }

  return (
    <div className="mt-2 text-xs">
      <table className="w-full">
        <thead className="text-left text-gray-400">
          <tr>
            <th className="font-semibold p-1">TIC ID</th>
            <th className="font-semibold p-1">Class</th>
            <th className="font-semibold p-1">Period</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res) => (
            <tr key={res.ticId} className="border-t border-space-light/50">
              <td className="p-1">{res.ticId}</td>
              <td className="p-1">{res.status === 'success' ? res.classification?.cnn.bestGuess : 'Error'}</td>
              {/* FIX: Access the 'value' property of blsPeriod before calling toFixed and handle optional detection property. */}
              <td className="p-1">{res.status === 'success' && res.detection ? res.detection.blsPeriod.value.toFixed(2) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BatchResultsTable;
