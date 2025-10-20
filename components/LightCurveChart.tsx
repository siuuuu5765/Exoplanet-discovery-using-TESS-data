// components/LightCurveChart.tsx

import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import type { LightCurvePoint } from '../types';

interface LightCurveChartProps {
  data: LightCurvePoint[];
  period: number; // Keep for potential future use, e.g., highlighting transits
}

// FIX: This chart visualizes the full, un-phased light curve data from TESS.
const LightCurveChart: React.FC<LightCurveChartProps> = ({ data, period }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      const trace = {
        x: data.map(p => p.time),
        y: data.map(p => p.brightness),
        mode: 'markers',
        type: 'scattergl', // Use WebGL for better performance with large datasets
        name: 'TESS Photometry',
        marker: {
          color: '#00ffff', // cyan
          size: 2,
          opacity: 0.7
        },
        hoverinfo: 'skip'
      };

      const yMin = Math.min(...data.map(p => p.brightness));
      const yMax = Math.max(...data.map(p => p.brightness));
      const yRangePadding = (yMax - yMin) * 0.1; // Add 10% padding

      const layout: Partial<Plotly.Layout> = {
        title: {
            text: 'Full TESS Light Curve',
            font: {
                family: 'Orbitron, sans-serif',
                size: 18,
                color: '#00ffff'
            },
            y: 0.95,
            x: 0.5,
            xanchor: 'center',
            yanchor: 'top'
        },
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        plot_bgcolor: 'rgba(0, 0, 0, 0.2)',
        font: { color: '#d1d5db', family: 'Roboto, sans-serif' },
        xaxis: {
            title: 'Time (hours)',
            gridcolor: '#3b4262',
            linecolor: '#9ca3af',
            zeroline: false
        },
        yaxis: {
            title: 'Normalized Brightness',
            gridcolor: '#3b4262',
            linecolor: '#9ca3af',
            zeroline: false,
            range: [yMin - yRangePadding, yMax + yRangePadding]
        },
        margin: { l: 60, r: 20, b: 50, t: 50 },
        showlegend: false,
        hovermode: 'x unified',
      };
      
      const config: Partial<Plotly.Config> = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines']
      };

      Plotly.react(chartRef.current, [trace as any], layout, config);
    }
  }, [data, period]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
  );
};

export default LightCurveChart;
