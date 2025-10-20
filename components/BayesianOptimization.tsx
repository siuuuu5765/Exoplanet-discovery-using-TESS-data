// components/BayesianOptimization.tsx
import React from 'react';
import { CpuChipIcon } from './Icons';

// FIX: This component is a placeholder to describe Bayesian Optimization's role.

const BayesianOptimization: React.FC = () => {
  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h3 className="text-lg font-bold font-display text-accent-cyan mb-3 flex items-center">
        <CpuChipIcon className="w-6 h-6 mr-2" />
        Advanced Parameter Tuning: Bayesian Optimization
      </h3>
      <p className="text-sm text-gray-300 mb-2">
        This section could demonstrate the use of Bayesian Optimization to fine-tune the parameters of our transit detection models.
      </p>
      <p className="text-xs text-gray-400">
        Instead of a brute-force grid search, Bayesian Optimization intelligently selects the next set of parameters (like transit period, depth, and duration) to test. It builds a probabilistic model of the objective function (e.g., the signal-to-noise ratio) and uses it to select the most promising parameters to evaluate next. This leads to a more efficient and often more accurate characterization of exoplanet candidates, especially for faint signals.
      </p>
       <div className="mt-4 text-center text-gray-500 italic">
            (This is a conceptual placeholder component.)
      </div>
    </div>
  );
};

export default BayesianOptimization;
