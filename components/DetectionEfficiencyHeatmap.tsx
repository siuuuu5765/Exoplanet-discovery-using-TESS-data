// components/DetectionEfficiencyHeatmap.tsx

import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { InjectionResult } from '../types';

interface HeatmapProps {
    data: InjectionResult[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as InjectionResult;
    return (
      <div className="bg-space-dark/80 p-2 border border-accent-cyan rounded-md shadow-lg text-sm">
        <p className="label text-gray-300">{`Injected Period: ${data.injectedPeriod.toFixed(2)} days`}</p>
        <p className="label text-gray-300">{`Injected Depth: ${(data.injectedDepth * 100).toFixed(3)}%`}</p>
        <p className={`font-bold ${data.recovered ? 'text-green-400' : 'text-red-400'}`}>
            Status: {data.recovered ? `Recovered at ${data.recoveredPeriod?.toFixed(2)} days` : 'Not Recovered'}
        </p>
      </div>
    );
  }
  return null;
};

const DetectionEfficiencyHeatmap: React.FC<HeatmapProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-400 mt-4">Run sweep to see detection efficiency results.</p>;
    }

    const chartData = data.map(d => ({
        ...d,
        size: 200, // for bubble size
    }));

    return (
        <div style={{ width: '100%', height: 400 }} className="mt-6">
            <h4 className="text-md font-bold font-display text-accent-cyan mb-4 text-center">Detection Efficiency Results</h4>
             <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 30 }}>
                    <CartesianGrid stroke="#3b4262" />
                    <XAxis 
                        type="number" 
                        dataKey="injectedPeriod" 
                        name="Period" 
                        unit=" days" 
                        stroke="#9ca3af"
                        tick={{ fill: '#d1d5db', fontSize: 12 }}
                        label={{ value: 'Injected Period (days)', position: 'insideBottom', offset: -25, fill: '#d1d5db' }}
                        domain={['dataMin - 1', 'dataMax + 1']}
                        />
                    <YAxis 
                        type="number" 
                        dataKey="injectedDepth" 
                        name="Depth" 
                        unit="%" 
                        stroke="#9ca3af"
                        tickFormatter={(tick) => (tick * 100).toFixed(2)}
                        tick={{ fill: '#d1d5db', fontSize: 12 }}
                        label={{ value: 'Transit Depth (%)', angle: -90, position: 'insideLeft', offset: -10, fill: '#d1d5db' }}
                        domain={['dataMin - 0.001', 'dataMax + 0.001']}
                        />
                    <ZAxis type="number" dataKey="size" range={[50, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#d1d5db' }}/>
                    <Scatter name="Recovered" data={chartData.filter(d => d.recovered)} fill="#22c55e" shape="circle" />
                    <Scatter name="Not Recovered" data={chartData.filter(d => !d.recovered)} fill="#ef4444" shape="cross" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DetectionEfficiencyHeatmap;