
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { LightCurvePoint } from '../types';

interface LightCurveChartProps {
  data: LightCurvePoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-space-dark/80 p-2 border border-accent-cyan rounded-md shadow-lg">
        <p className="label text-gray-300">{`Time : ${label.toFixed(2)} hours`}</p>
        <p className="intro text-accent-cyan">{`Brightness : ${payload[0].value.toFixed(4)}`}</p>
      </div>
    );
  }
  return null;
};

const LightCurveChart: React.FC<LightCurveChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3b4262" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fill: '#d1d5db' }}
            label={{ value: 'Time (hours)', position: 'insideBottom', offset: -15, fill: '#d1d5db' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            domain={[0.99, 1.01]} 
            tick={{ fill: '#d1d5db' }}
            label={{ value: 'Normalized Brightness', angle: -90, position: 'insideLeft', fill: '#d1d5db', dx: -5 }}
            />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#d1d5db' }}/>
          <Line 
            type="monotone" 
            dataKey="brightness" 
            stroke="#00ffff" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6, fill: '#ff00ff' }}
            name="Stellar Brightness"
            />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LightCurveChart;
