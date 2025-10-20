// components/LightCurveChart.tsx

import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import type { LightCurvePoint } from '../types';

interface LightCurveChartProps {
  data: LightCurvePoint[];
  period: number; 
  epoch: number;
  duration: number;
}

// FIX: This chart visualizes the full, un-phased light curve data from TESS.
const LightCurveChart: React.FC<LightCurveChartProps> = ({ data, period, epoch, duration }) => {
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

      // --- Calculate transit highlights ---
      const shapes = [];
      const periodInHours = period * 24;
      const firstTime = data[0].time;
      // For mock data, epoch might be a large BJD. We need a reference time.
      // Let's find the first transit *after* our data starts.
      const firstEpoch = epoch > firstTime ? epoch : epoch + Math.ceil((firstTime - epoch) / periodInHours) * periodInHours;

      for (let transitTime = firstEpoch; transitTime < data[data.length - 1].time; transitTime += periodInHours) {
        shapes.push({
          type: 'rect',
          xref: 'x',
          yref: 'paper',
          x0: transitTime - duration / 2,
          y0: 0,
          x1: transitTime + duration / 2,
          y1: 1,
          fillcolor: '#ef4444',
          opacity: 0.3,
          line: {
            width: 0,
          },
        });
      }


      const yMin = Math.min(...data.map(p => p.brightness));
      const yMax = Math.max(...data.map(p => p.brightness));
      const yRangePadding = (yMax - yMin) * 0.1; // Add 10% padding

      const layout: Partial<Plotly.Layout> = {
        title: {
            text: 'Host Star Brightness Over Time (TESS Light Curve)',
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
            title: 'Host Star Brightness (Normalized)',
            gridcolor: '#3b4262',
            linecolor: '#9ca3af',
            zeroline: false,
            range: [yMin - yRangePadding, yMax + yRangePadding]
        },
        margin: { l: 60, r: 20, b: 50, t: 50 },
        showlegend: false,
        hovermode: 'x unified',
        shapes: shapes,
      };
      
      const config: Partial<Plotly.Config> = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines']
      };

      Plotly.react(chartRef.current, [trace as any], layout, config);
    }
  }, [data, period, epoch, duration]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
  );
};

export default LightCurveChart;