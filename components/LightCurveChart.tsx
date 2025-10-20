// components/LightCurveChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import type { LightCurvePoint } from '../types';

interface LightCurveChartProps {
  data: LightCurvePoint[];
  period: number; // in days
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-space-dark/80 p-2 border border-accent-cyan rounded-md shadow-lg">
        <p className="label text-gray-300">{`Time : ${label.toFixed(2)} hours`}</p>
        <p className="intro text-accent-cyan">{`Brightness : ${payload[0].value.toFixed(5)}`}</p>
      </div>
    );
  }
  return null;
};


const LightCurveChart: React.FC<LightCurveChartProps> = ({ data, period }) => {
    // This is a simplified way to highlight potential transits.
    // A real implementation would use the epoch and duration from the analysis.
    const transits = [];
    if (period > 0 && data.length > 0) {
        const periodInHours = period * 24;
        const transitDurationHours = periodInHours * 0.05; // Assume duration is 5% of period
        const firstTransit = data.find(p => p.brightness < 0.999);
        const epoch = firstTransit ? firstTransit.time % periodInHours : periodInHours / 2;

        for (let i = 0; i * periodInHours < data[data.length - 1].time; i++) {
            const transitCenter = epoch + i * periodInHours;
            transits.push(
                <ReferenceArea 
                    key={i} 
                    x1={transitCenter - transitDurationHours / 2} 
                    x2={transitCenter + transitDurationHours / 2} 
                    stroke="none" 
                    fill="#ef4444" 
                    fillOpacity={0.2} 
                />
            );
        }
    }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 className="text-md font-bold text-center text-gray-300 mb-2">TESS Light Curve</h3>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3b4262" />
          <XAxis 
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke="#9ca3af"
            tick={{ fill: '#d1d5db' }}
            label={{ value: 'Time (hours)', position: 'insideBottom', offset: -15, fill: '#d1d5db' }}
            />
          <YAxis 
            dataKey="brightness"
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            allowDataOverflow={true}
            stroke="#9ca3af"
            tickFormatter={(tick) => tick.toFixed(4)}
            tick={{ fill: '#d1d5db' }}
            label={{ value: 'Normalized Brightness', angle: -90, position: 'insideLeft', fill: '#d1d5db' }}
            />
          <Tooltip content={<CustomTooltip />} />
          {transits}
          <Line 
            type="monotone" 
            dataKey="brightness" 
            stroke="#00ffff" 
            strokeWidth={1} 
            dot={false}
            name="Brightness"
            />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LightCurveChart;
