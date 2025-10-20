// components/BlsPowerSpectrumChart.tsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { BlsResultPoint } from '../types';

interface BlsPowerSpectrumChartProps {
  data: BlsResultPoint[];
  bestPeriod: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-space-dark/80 p-2 border border-accent-cyan rounded-md shadow-lg">
        <p className="label text-gray-300">{`Period : ${label.toFixed(2)} days`}</p>
        <p className="intro text-accent-cyan">{`Power : ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

// FIX: This chart visualizes the Box-fitting Least Squares (BLS) power spectrum.
const BlsPowerSpectrumChart: React.FC<BlsPowerSpectrumChartProps> = ({ data, bestPeriod }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 30,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3b4262" />
          <XAxis 
            dataKey="period" 
            stroke="#9ca3af"
            tick={{ fill: '#d1d5db' }}
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ value: 'Period (days)', position: 'insideBottom', offset: -25, fill: '#d1d5db' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fill: '#d1d5db' }}
            label={{ value: 'BLS Power', angle: -90, position: 'insideLeft', fill: '#d1d5db', dx: -25 }}
            />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: '10px' }}/>
          <Line 
            type="monotone" 
            dataKey="power" 
            stroke="#ff00ff" 
            strokeWidth={2} 
            dot={false}
            name="Signal Power"
            />
          <ReferenceLine x={bestPeriod} stroke="#00ffff" strokeWidth={2} strokeDasharray="3 3" label={{ value: `Peak: ${bestPeriod.toFixed(2)}d`, fill: '#00ffff', position: 'insideTopRight' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BlsPowerSpectrumChart;