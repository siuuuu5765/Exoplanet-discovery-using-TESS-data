// components/BlsPowerSpectrumChart.tsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
// FIX: Corrected import path for type definition
import type { BlsPowerSpectrumPoint } from '../types';

interface BlsPowerSpectrumChartProps {
  data: BlsPowerSpectrumPoint[];
  detectedPeriod: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-space-dark/80 p-2 border border-accent-cyan rounded-md shadow-lg">
        <p className="label text-gray-300">{`Period : ${label.toFixed(4)} days`}</p>
        <p className="intro text-accent-cyan">{`Power : ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const BlsPowerSpectrumChart: React.FC<BlsPowerSpectrumChartProps> = ({ data, detectedPeriod }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
       <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">BLS Power Spectrum</h3>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3b4262" />
          <XAxis 
            dataKey="period" 
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke="#9ca3af"
            tick={{ fill: '#d1d5db', fontSize: 12 }}
            label={{ value: 'Period (days)', position: 'insideBottom', offset: -15, fill: '#d1d5db' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fill: '#d1d5db', fontSize: 12 }}
            label={{ value: 'BLS Power', angle: -90, position: 'insideLeft', fill: '#d1d5db' }}
            />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="power" 
            stroke="#00ffff" 
            strokeWidth={2}
            dot={false}
            name="BLS Power"
            />
          {/* FIX: Add ReferenceLine to show the detected period on the chart */}
          <ReferenceLine x={detectedPeriod} stroke="#ff00ff" strokeDasharray="3 3" label={{ value: `Detected: ${detectedPeriod.toFixed(4)} d`, fill: '#ff00ff', position: 'insideTopRight' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BlsPowerSpectrumChart;
