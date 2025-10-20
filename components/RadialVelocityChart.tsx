
import React from 'react';
// The `defs`, `linearGradient`, and `stop` elements are used as standard SVG elements within the chart.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// FIX: Corrected import path for type definition
import type { RadialVelocityPoint } from '../types';

interface RadialVelocityChartProps {
  data: RadialVelocityPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-space-dark/80 p-2 border border-accent-cyan rounded-md shadow-lg">
        <p className="label text-gray-300">{`Time : ${label.toFixed(2)} days`}</p>
        <p className="intro text-accent-cyan">{`Velocity : ${payload[0].value.toFixed(2)} m/s`}</p>
      </div>
    );
  }
  return null;
};

const RadialVelocityChart: React.FC<RadialVelocityChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 10,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="velocityColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#d1d5db" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3b4262" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fill: '#d1d5db' }}
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ value: 'Time (days)', position: 'insideBottom', offset: -15, fill: '#d1d5db' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fill: '#d1d5db' }}
            label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft', fill: '#d1d5db', dx: -15 }}
            />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#d1d5db' }}/>
          <Line 
            type="monotone" 
            dataKey="velocity" 
            stroke="url(#velocityColor)" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: '#ff00ff' }}
            name="Stellar Wobble (Blueshift/Redshift)"
            />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadialVelocityChart;