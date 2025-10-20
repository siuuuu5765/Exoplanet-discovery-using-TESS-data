// components/PhaseFoldedLightCurveChart.tsx

import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import type { PhaseFoldedPoint } from '../types';

interface PhaseFoldedLightCurveChartProps {
  data: PhaseFoldedPoint[];
  modelData: PhaseFoldedPoint[];
}

const PhaseFoldedLightCurveChart: React.FC<PhaseFoldedLightCurveChartProps> = ({ data, modelData }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      const observedTrace = {
        x: data.map(p => p.phase),
        y: data.map(p => p.brightness),
        mode: 'markers',
        type: 'scatter' as any,
        name: 'Observed Data',
        marker: { color: '#00ffff', size: 5, opacity: 0.7 },
        hoverinfo: 'skip'
      };

      const modelTrace = {
        x: modelData.map(p => p.phase),
        y: modelData.map(p => p.brightness),
        mode: 'lines',
        type: 'scatter' as any,
        name: 'Transit Model Fit',
        line: { color: '#ef4444', width: 2.5 },
        hovertemplate: '<b>Model Fit</b><br>Phase: %{x:.3f}<br>Brightness: %{y:.4f}<extra></extra>'
      };

      const yDomainMin = Math.min(...data.map(p => p.brightness)) - 0.001;

      const layout: Partial<Plotly.Layout> = {
        title: {
            text: 'Phase-Folded Light Curve & Model Fit',
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
            title: 'Orbital Phase',
            gridcolor: '#3b4262',
            linecolor: '#9ca3af',
            zeroline: false,
            range: [-0.5, 0.5]
        },
        yaxis: {
            title: 'Normalized Brightness',
            gridcolor: '#3b4262',
            linecolor: '#9ca3af',
            zeroline: false,
            range: [yDomainMin, 1.002]
        },
        margin: { l: 60, r: 20, b: 50, t: 50 },
        legend: {
            x: 0.5,
            y: -0.25,
            xanchor: 'center',
            orientation: 'h',
            font: { size: 12 }
        },
        hovermode: 'x unified',
      };
      
      const config: Partial<Plotly.Config> = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines']
      };

      Plotly.react(chartRef.current, [observedTrace as any, modelTrace as any], layout, config);
    }
  }, [data, modelData]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
  );
};

export default PhaseFoldedLightCurveChart;