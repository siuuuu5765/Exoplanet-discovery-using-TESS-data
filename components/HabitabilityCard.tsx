import React from 'react';
// FIX: Corrected import path for Icons component
import { LeafIcon } from './Icons';

interface HabitabilityCardProps {
  score: number;
  inZone: boolean;
}

const getScoreColor = (score: number) => {
  if (score < 3) return '#ef4444'; // red-500
  if (score < 7) return '#f59e0b'; // amber-500
  return '#22c55e'; // green-500
};

const getScoreLabel = (score: number) => {
    if (score < 3) return 'Harsh';
    if (score < 5) return 'Low Potential';
    if (score < 7) return 'Moderate';
    if (score < 9) return 'Promising';
    return 'Excellent';
}

const HabitabilityCard: React.FC<HabitabilityCardProps> = ({ score, inZone }) => {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 45; // 2 * pi * r
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
      <h4 className="text-sm text-gray-400 font-semibold flex items-center mb-3">
        Habitability Analysis
      </h4>
      <div className="flex items-center gap-4">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-space-light"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            {/* Progress circle */}
            <circle
              strokeWidth="10"
              strokeLinecap="round"
              stroke={color}
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 0.8s ease-out',
              }}
            />
             <text x="50" y="50" fontFamily="sans-serif" fontSize="20" textAnchor="middle" alignmentBaseline="middle" fill={color} className="font-bold">
              {score.toFixed(1)}
            </text>
             <text x="50" y="68" fontFamily="sans-serif" fontSize="10" textAnchor="middle" fill="white">
              / 10
            </text>
          </svg>
        </div>
        <div className="flex flex-col">
            <p className="text-lg font-bold" style={{ color: color }}>
                {getScoreLabel(score)}
            </p>
            {inZone ? (
                <div className="flex items-center text-xs text-green-300 mt-1">
                    <LeafIcon className="w-4 h-4 mr-1" />
                    <span>In Habitable "Goldilocks" Zone</span>
                </div>
            ) : (
                 <div className="flex items-center text-xs text-amber-300 mt-1">
                    <span>Outside Habitable Zone</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HabitabilityCard;