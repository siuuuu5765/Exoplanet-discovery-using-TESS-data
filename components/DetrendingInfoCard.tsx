// components/DetrendingInfoCard.tsx
import React from 'react';
import { ChartBarIcon } from './Icons'; // Re-using an icon

const DetrendingInfoCard: React.FC = () => {
  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h3 className="text-sm text-gray-400 font-semibold flex items-center mb-3">
        <ChartBarIcon className="w-5 h-5 mr-2 text-accent-gold" />
        Data Pre-processing: Detrending
      </h3>
      <p className="text-xs text-gray-300">
        Raw TESS light curves often contain instrumental noise and stellar variability that can obscure faint transit signals. Before analysis, the data is "detrended" to remove these long-term trends.
      </p>
      <p className="text-xs text-gray-400 mt-2">
        A common method is using a Savitzky-Golay filter or a biweight moving median to model the slow variations, which is then subtracted from the data. This process isolates the short-duration transit events we are looking for, significantly improving the sensitivity of our detection algorithms.
      </p>
    </div>
  );
};

export default DetrendingInfoCard;
