// components/TransitDetailChart.tsx
import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import type { LightCurvePoint, PhaseFoldedPoint } from '../types';

interface TransitDetailChartProps {
  lightCurve: LightCurvePoint[];
  period: number;
  epoch: number;
  duration: number;
  modelData: PhaseFoldedPoint[];
}

const TransitDetailChart: React.FC<TransitDetailChartProps> = ({ lightCurve, period, epoch, duration, modelData }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && lightCurve.length > 0) {
      const transitSnippets: { phase: number; brightness: number }[] = [];
      const periodInHours = period * 24;

      const firstTime = lightCurve[0].time;
      const firstEpoch = epoch > firstTime ? epoch : epoch + Math.ceil((firstTime - epoch) / periodInHours) * periodInHours;

      // Extract data snippets around each transit
      for (let transitTime = firstEpoch; transitTime < lightCurve[lightCurve.length - 1].time; transitTime += periodInHours) {
        const windowStart = transitTime - duration * 2;
        const windowEnd = transitTime + duration * 2;
        
        for (const point of lightCurve) {
          if (point.time >= windowStart && point.time <= windowEnd) {
            // Calculate phase relative to this specific transit's center
            const phase = ((point.time - transitTime) / periodInHours);
            transitSnippets.push({ phase: phase, brightness: point.brightness });
          }
        }
      }

      const observedTrace = {
        x: transitSnippets.map(p => p.phase),
        y: transitSnippets.map(p => p.brightness),
        mode: 'markers',
        type: 'scatter' as any,
        name: 'Observed Transits',
        marker: { color: '#00ffff', size: 4, opacity: 0.6 },
        hovertemplate: 'Phase: %{x:.4f}<br>Flux: %{y:.5f}<extra></extra>'
      };
      
      const modelTrace = {
        x: modelData.map(p => p.phase),
        y: modelData.map(p => p.brightness),
        mode: 'lines',
        type: 'scatter' as any,
        name: 'Transit Model Fit',
        line: { color: '#ef4444', width: 2.5 },
        hovertemplate: '<b>Model</b><br>Phase: %{x:.3f}<br>Brightness: %{y:.4f}<extra></extra>'
      };
      
      const yMin = Math.min(...transitSnippets.map(p => p.brightness));
      const yMax = Math.max(...transitSnippets.map(p => p.brightness));
      const yRangePadding = (yMax - yMin) * 0.1;

      const layout: Partial<Plotly.Layout> = {
        title: {
            text: 'Detailed View of Host Star Brightness Dips',
            font: {
                family: 'Orbitron, sans-serif',
                size: 18,
                color: '#00ffff'
            },
            y: 0.95, x: 0.5, xanchor: 'center', yanchor: 'top'
        },
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        plot_bgcolor: 'rgba(0, 0, 0, 0.2)',
        font: { color: '#d1d5db', family: 'Roboto, sans-serif' },
        xaxis: {
            title: 'Orbital Phase (Centered on Transit)',
            gridcolor: '#3b4262',
            linecolor: '#9ca3af',
            zeroline: true,
            zerolinecolor: '#475569',
            range: [-(duration * 2) / periodInHours, (duration * 2) / periodInHours] // Zoom in on the transit
        },
        yaxis: {
            title: 'Host Star Brightness (Normalized)',
            gridcolor: '#3b4262',
            linecolor: '#9ca3af',
            zeroline: false,
            range: [yMin - yRangePadding, yMax + yRangePadding]
        },
        margin: { l: 60, r: 20, b: 80, t: 50 },
        legend: {
            x: 0.5, y: -0.25, xanchor: 'center', orientation: 'h', font: { size: 12 }
        },
        hovermode: 'x unified',
      };
      
      const config: Partial<Plotly.Config> = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines']
      };

      Plotly.react(chartRef.current, [observedTrace, modelTrace] as any[], layout, config);
    }
  }, [lightCurve, period, epoch, duration, modelData]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
  );
};

export default TransitDetailChart;