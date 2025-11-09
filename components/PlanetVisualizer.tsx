// components/PlanetVisualizer.tsx
import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import type { PlanetAnalysis } from '../types';

interface PlanetVisualizerProps {
  planet: PlanetAnalysis['planet'];
  star: PlanetAnalysis['star'];
}

const PlanetVisualizer: React.FC<PlanetVisualizerProps> = ({ planet, star }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();

    // Determine orbit color based on temperature
    const getOrbitColor = (temp: number) => {
        if (temp < 200) return '#60a5fa'; // blue-400
        if (temp < 373) return '#00ffff'; // cyan
        if (temp < 600) return '#facc15'; // yellow-400
        return '#fb923c'; // orange-400
    };
    
    useEffect(() => {
        if (!chartRef.current) return;

        const safePeriod = planet.period.value > 0.1 ? planet.period.value : 10;
        // Use a logarithmic scale for the orbital radius to keep visuals manageable
        const orbitRadius = 2 + Math.log10(safePeriod + 1); 
        const planetSize = Math.max(8, Math.min(planet.radius.value * 2, 20));
        const orbitColor = getOrbitColor(planet.temperature);

        // Generate points for the orbit path
        const orbitPathX: number[] = [];
        const orbitPathY: number[] = [];
        for (let i = 0; i <= 360; i++) {
            const angle = i * (Math.PI / 180);
            orbitPathX.push(orbitRadius * Math.cos(angle));
            orbitPathY.push(orbitRadius * Math.sin(angle));
        }

        const starTrace = {
            x: [0],
            y: [0],
            mode: 'markers',
            name: 'Star',
            marker: {
                color: 'rgba(253, 224, 71, 0.9)', // yellow-300
                size: 35,
                line: {
                    color: 'rgba(253, 224, 71, 0.5)',
                    width: 8
                }
            },
            hoverinfo: 'text',
            text: `Star: ${star.name}<br>Type: ${star.type}`,
        };

        const orbitTrace = {
            x: orbitPathX,
            y: orbitPathY,
            mode: 'lines',
            name: 'Orbit',
            line: {
                color: orbitColor,
                width: 2,
                dash: 'dot'
            },
            hoverinfo: 'none',
        };

        const planetTrace = {
            x: [orbitRadius],
            y: [0],
            mode: 'markers',
            name: 'Planet',
            marker: {
                color: orbitColor,
                size: planetSize,
                line: { color: 'white', width: 1 },
            },
            hovertemplate: 
                `<b>Planet: ${planet.name}</b><br>` +
                `Mass: ${planet.mass.value.toFixed(2)} M⊕<br>` +
                `Radius: ${planet.radius.value.toFixed(2)} R⊕<br>` +
                `Temp: ${planet.temperature} K<extra></extra>`,
        };
        
        const layout: Partial<Plotly.Layout> = {
            title: {
                text: 'Orbital System Visualization',
                font: { family: 'Orbitron, sans-serif', size: 16, color: '#00ffff' },
                y: 0.95, x: 0.5, xanchor: 'center', yanchor: 'top'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            xaxis: {
                showgrid: false,
                zeroline: false,
                visible: false,
                range: [-orbitRadius * 1.5, orbitRadius * 1.5]
            },
            yaxis: {
                showgrid: false,
                zeroline: false,
                visible: false,
                scaleanchor: 'x', // Ensures a 1:1 aspect ratio for a circular orbit
                scaleratio: 1,
                range: [-orbitRadius * 1.5, orbitRadius * 1.5]
            },
            margin: { l: 20, r: 20, b: 20, t: 40 },
            hovermode: 'closest',
            annotations: [
                {
                    x: 0,
                    y: -0.25,
                    text: `Star Type: ${star.type}`,
                    showarrow: false,
                    font: { color: 'rgba(253, 224, 71, 0.8)', size: 10 },
                },
                {
                    x: orbitRadius / Math.sqrt(2),
                    y: orbitRadius / Math.sqrt(2),
                    ax: 30,
                    ay: 30,
                    text: `P ≈ ${safePeriod.toFixed(1)} days`,
                    showarrow: true,
                    arrowhead: 0,
                    font: { color: orbitColor, size: 10 },
                }
            ]
        };
        
        const config: Partial<Plotly.Config> = {
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines']
        };

        Plotly.newPlot(chartRef.current, [starTrace as any, orbitTrace as any, planetTrace as any], layout, config);

        // Animation logic
        let angle = 0;
        // Adjust speed based on period - longer period = slower animation
        const speed = 360 / (safePeriod * 60); 

        const animate = () => {
            angle = (angle + speed) % 360;
            const rad = angle * (Math.PI / 180);
            const update = {
                x: [[orbitRadius * Math.cos(rad)]],
                y: [[orbitRadius * Math.sin(rad)]],
            };
            if(chartRef.current){
                Plotly.restyle(chartRef.current, update, [2]); // Update the 3rd trace (planetTrace)
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

    }, [planet, star]); // Re-render if planet or star data changes

    return (
        <div className="bg-space-blue/50 p-2 rounded-lg shadow-md border border-space-light backdrop-blur-sm h-full flex flex-col justify-center items-center">
            <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '300px' }}></div>
        </div>
    );
};

export default PlanetVisualizer;
