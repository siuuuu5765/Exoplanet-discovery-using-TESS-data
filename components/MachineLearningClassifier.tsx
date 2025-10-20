// components/MachineLearningClassifier.tsx
import React, { useState } from 'react';
import type { PlanetAnalysis, ClassifierOutput, ClassificationPrediction, FeatureImportance } from '../types';
import { CpuChipIcon, ChartBarIcon } from './Icons';

interface MachineLearningClassifierProps {
  result: PlanetAnalysis['classification'];
}

const classificationInfo: { [key: string]: { color: string; description: string; } } = {
  'Planet Candidate': { color: 'bg-green-500', description: 'A periodic dip in brightness consistent with a planet passing in front of its star.' },
  'Eclipsing Binary': { color: 'bg-amber-500', description: 'Two stars orbiting each other, causing deep, often V-shaped eclipses.' },
  'Stellar Variability': { color: 'bg-sky-500', description: 'Natural brightness changes in the star itself, often due to starspots or pulsations.' },
  'Noise': { color: 'bg-red-500', description: 'Random fluctuations in the data with no discernible periodic signal, likely due to instrument effects.' },
};

const ConfidenceBars: React.FC<{ predictions: ClassificationPrediction[] }> = ({ predictions }) => (
  <div className="space-y-2 mt-3">
    {predictions.sort((a,b) => b.confidence - a.confidence).map(pred => (
      <div key={pred.class} title={classificationInfo[pred.class]?.description}>
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium text-gray-300">{pred.class}</span>
          <span className="text-gray-400">{(pred.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-space-light rounded-full h-2.5">
          <div
            className={`${classificationInfo[pred.class]?.color || 'bg-gray-500'} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${pred.confidence * 100}%` }}
          ></div>
        </div>
      </div>
    ))}
  </div>
);

const FeatureImportanceChart: React.FC<{ features: FeatureImportance[] }> = ({ features }) => (
    <div className="mt-4 border-t border-space-light pt-3">
        <h5 className="text-xs text-gray-400 font-semibold flex items-center mb-2">
            <ChartBarIcon className="w-4 h-4 mr-1.5" />
            Feature Importance (for Random Forest)
        </h5>
        <div className="space-y-2">
            {features.sort((a, b) => b.score - a.score).map(feature => (
                <div key={feature.feature} className="flex items-center text-xs">
                    <span className="w-16 font-medium text-gray-300 capitalize">{feature.feature}</span>
                    <div className="flex-1 bg-space-light rounded-full h-4">
                        <div 
                            className="bg-accent-magenta h-4 rounded-full text-right pr-2 text-black font-bold"
                            style={{ width: `${feature.score * 100}%` }}
                        >
                            {(feature.score * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const MachineLearningClassifier: React.FC<MachineLearningClassifierProps> = ({ result }) => {
  const [activeModel, setActiveModel] = useState<'cnn' | 'rf'>('cnn');
  const activeData: ClassifierOutput = activeModel === 'cnn' ? result.cnn : result.randomForest;

  const getBestGuessColor = (guess: string) => {
      return classificationInfo[guess]?.color.replace('bg-', 'text-') || 'text-gray-200';
  }

  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h4 className="text-sm text-gray-400 font-semibold flex items-center mb-2">
        <CpuChipIcon className="w-5 h-5 mr-2 text-accent-cyan" />
        ML Signal Classification
      </h4>
      
      <div className="flex bg-space-light p-1 rounded-md text-sm">
        <button 
            onClick={() => setActiveModel('cnn')}
            className={`flex-1 py-1 rounded transition-colors ${activeModel === 'cnn' ? 'bg-accent-cyan text-space-dark font-bold' : 'text-gray-300'}`}
        >
            1D CNN Model
        </button>
        <button 
            onClick={() => setActiveModel('rf')}
            className={`flex-1 py-1 rounded transition-colors ${activeModel === 'rf' ? 'bg-accent-cyan text-space-dark font-bold' : 'text-gray-300'}`}
        >
            Random Forest
        </button>
      </div>
      
      <div className="text-center mt-3">
          <p className="text-xs text-gray-400">Model Prediction:</p>
          <p className={`text-lg font-bold font-display ${getBestGuessColor(activeData.bestGuess)}`}>
              {activeData.bestGuess}
          </p>
      </div>

      <ConfidenceBars predictions={activeData.predictions} />

      {activeModel === 'rf' && activeData.featureImportance && (
          <FeatureImportanceChart features={activeData.featureImportance} />
      )}
    </div>
  );
};

export default MachineLearningClassifier;
