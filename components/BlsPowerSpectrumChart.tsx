// components/BlsPowerSpectrumChart.tsx
import React, { useEffect, useRef } from 'react';
// FIX: Use namespace import for Plotly to correctly resolve types like Plotly.Layout.
import * as Plotly from 'plotly.js-dist-min';
import type { BlsResultPoint } from '../types';

interface BlsPowerSpectrumChartProps {
    data: BlsResultPoint[];
    detectedPeriod: number;
}

const BlsPowerSpectrumChart: React.FC<BlsPowerSpectrumChartProps> = ({ data, detectedPeriod }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chartRef.current && data.length > 0) {
            const trace = {
                x: data.map(p => p.period),
                y: data.map(p => p.power),
                mode: 'lines',
                type: 'scatter' as any,
                name: 'BLS Power',
                line: { color: '#00ffff', width: 2 },
                hovertemplate: 'Period: %{x:.2f} d<br>Power: %{y:.2f}<extra></extra>'
            };
            
            const maxPower = Math.max(...data.map(p => p.power));

            const layout: Partial<Plotly.Layout> = {
                title: {
                    text: 'Box-Least Squares (BLS) Periodogram',
                    font: { family: 'Orbitron, sans-serif', size: 18, color: '#00ffff' },
                    y: 0.95, x: 0.5, xanchor: 'center', yanchor: 'top'
                },
                paper_bgcolor: 'rgba(0, 0, 0, 0)',
                plot_bgcolor: 'rgba(0, 0, 0, 0.2)',
                font: { color: '#d1d5db', family: 'Roboto, sans-serif' },
                xaxis: { title: 'Period (days)', gridcolor: '#3b4262', linecolor: '#9ca3af' },
                yaxis: { title: 'Signal Power', gridcolor: '#3b4262', linecolor: '#9ca3af' },
                margin: { l: 60, r: 20, b: 50, t: 50 },
                shapes: [
                    {
                        type: 'line',
                        x0: detectedPeriod,
                        x1: detectedPeriod,
                        y0: 0,
                        y1: maxPower * 1.1,
                        line: {
                            color: '#ef4444',
                            width: 2,
                            dash: 'dash'
                        },
                        name: `Detected Period: ${detectedPeriod.toFixed(2)} d`
                    }
                ],
                annotations: [
                    {
                        x: detectedPeriod,
                        y: maxPower * 1.1,
                        xref: 'x',
                        yref: 'y',
                        text: `Peak: ${detectedPeriod.toFixed(2)} d`,
                        showarrow: true,
                        arrowhead: 2,
                        ax: 0,
                        ay: -40,
                        font: { color: '#ef4444' },
                        bgcolor: 'rgba(12, 26, 62, 0.7)'
                    }
                ],
                 hovermode: 'x unified',
            };

            const config: Partial<Plotly.Config> = {
                responsive: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines']
            };

            Plotly.react(chartRef.current, [trace as any], layout, config);
        }
    }, [data, detectedPeriod]);

    return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

export default BlsPowerSpectrumChart;