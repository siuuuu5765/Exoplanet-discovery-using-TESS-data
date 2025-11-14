// components/LightCurveChart.tsx

import React, { useEffect, useRef } from 'react';
// FIX: Use namespace import for Plotly to correctly resolve types like Plotly.Layout.
import * as Plotly from 'plotly.js-dist-min';
import type { LightCurvePoint } from '../types';

interface LightCurveChartProps {
  data: LightCurvePoint[];
  period: number; 
  epoch: number;
  duration: number;
}

const LightCurveChart: React.FC<LightCurveChartProps> = ({ data, period, epoch, duration }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      const inTransitPoints = { x: [] as number[], y: [] as number[] };
      const outOfTransitPoints = { x: [] as number[], y: [] as number[] };
      const periodInHours = period * 24;

      if (periodInHours > 0 && duration > 0) {
        data.forEach(p => {
          const timeSinceEpoch = p.time - epoch;
          // Center the phase around 0, handling positive and negative time
          const phaseInHours = ((timeSinceEpoch % periodInHours) + periodInHours) % periodInHours;
          const centeredPhase = phaseInHours > periodInHours / 2 ? phaseInHours - periodInHours : phaseInHours;
      
          if (Math.abs(centeredPhase) <= duration / 2) {
            inTransitPoints.x.push(p.time);
            inTransitPoints.y.push(p.brightness);
          } else {
            outOfTransitPoints.x.push(p.time);
            outOfTransitPoints.y.push(p.brightness);
          }
        });
      } else {
        // If period/duration is invalid, plot all points normally
        outOfTransitPoints.x = data.map(p => p.time);
        outOfTransitPoints.y = data.map(p => p.brightness);
      }

      const outOfTransitTrace = {
        x: outOfTransitPoints.x,
        y: outOfTransitPoints.y,
        mode: 'markers',
        type: 'scattergl', // Use WebGL for better performance
        name: 'TESS Photometry',
        marker: {
          color: '#00ffff', // cyan
          size: 2,
          opacity: 0.7
        },
        hovertemplate: 'Time: %{x:.2f} hrs<br>Flux: %{y:.5f}<extra></extra>'
      };
      
      const inTransitTrace = {
        x: inTransitPoints.x,
        y: inTransitPoints.y,
        mode: 'markers',
        type: 'scattergl',
        name: 'In Transit',
        marker: {
          color: '#ef4444', // red
          size: 3,
          opacity: 0.9
        },
        hovertemplate: 'Time: %{x:.2f} hrs<br>Flux: %{y:.5f}<extra></extra>'
      };

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
        legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: 1.02,
            xanchor: 'right',
            x: 1
        },
        hovermode: 'x unified',
      };
      
      const config: Partial<Plotly.Config> = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines']
      };

      Plotly.react(chartRef.current, [outOfTransitTrace as any, inTransitTrace as any], layout, config);
    }
  }, [data, period, epoch, duration]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
  );
};

export default LightCurveChart;