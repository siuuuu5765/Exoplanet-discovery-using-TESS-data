// components/PlanetVisualizer.tsx
import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import type { VerifiedSystemProfile } from '../types';

interface PlanetVisualizerProps {
  profile: VerifiedSystemProfile;
}

const PlanetVisualizer: React.FC<PlanetVisualizerProps> = ({ profile }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();
    const { Star, Planet } = profile;

    const getOrbitColor = (temp: number | 'Not Available') => {
        if (temp === 'Not Available') return '#9ca3af'; // gray
        if (temp < 200) return '#60a5fa'; // blue-400
        if (temp < 373) return '#00ffff'; // cyan
        if (temp < 600) return '#facc15'; // yellow-400
        return '#fb923c'; // orange-400
    };
    
    useEffect(() => {
        if (!chartRef.current) return;

        const period = Planet.Orbital_Period_days !== 'Not Available' ? Planet.Orbital_Period_days : 10;
        const radius = Planet.Planet_Radius_Rearth !== 'Not Available' ? Planet.Planet_Radius_Rearth : 1;
        
        const safePeriod = period > 0.1 ? period : 10;
        const orbitRadius = 2 + Math.log10(safePeriod + 1); 
        const planetSize = Math.max(8, Math.min(radius * 2, 20));
        const orbitColor = getOrbitColor(Planet.Equilibrium_Temperature_K);

        const orbitPathX: number[] = [];
        const orbitPathY: number[] = [];
        for (let i = 0; i <= 360; i++) {
            const angle = i * (Math.PI / 180);
            orbitPathX.push(orbitRadius * Math.cos(angle));
            orbitPathY.push(orbitRadius * Math.sin(angle));
        }

        const starTrace = {
            x: [0], y: [0], mode: 'markers', name: 'Star',
            marker: { color: 'rgba(253, 224, 71, 0.9)', size: 35, line: { color: 'rgba(253, 224, 71, 0.5)', width: 8 } },
            hoverinfo: 'text', text: `Star: ${Star.Name}`,
        };

        const orbitTrace = {
            x: orbitPathX, y: orbitPathY, mode: 'lines', name: 'Orbit',
            line: { color: orbitColor, width: 2, dash: 'dot' }, hoverinfo: 'none',
        };

        const planetTrace = {
            x: [orbitRadius], y: [0], mode: 'markers', name: 'Planet',
            marker: { color: orbitColor, size: planetSize, line: { color: 'white', width: 1 } },
            hovertemplate: 
                `<b>Planet: ${Planet.Name}</b><br>` +
                `Mass: ${Planet.Planet_Mass_Mearth} M⊕<br>` +
                `Radius: ${Planet.Planet_Radius_Rearth} R⊕<br>` +
                `Temp: ${Planet.Equilibrium_Temperature_K} K<extra></extra>`,
        };
        
        const layout: Partial<Plotly.Layout> = {
            title: {
                text: 'Orbital System Visualization',
                font: { family: 'Orbitron, sans-serif', size: 16, color: '#00ffff' },
                y: 0.95, x: 0.5, xanchor: 'center', yanchor: 'top'
            },
            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', showlegend: false,
            xaxis: { showgrid: false, zeroline: false, visible: false, range: [-orbitRadius * 1.5, orbitRadius * 1.5] },
            yaxis: { showgrid: false, zeroline: false, visible: false, scaleanchor: 'x', scaleratio: 1, range: [-orbitRadius * 1.5, orbitRadius * 1.5] },
            margin: { l: 20, r: 20, b: 20, t: 40 }, hovermode: 'closest',
        };
        
        const config: Partial<Plotly.Config> = {
            responsive: true, displaylogo: false, modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines']
        };

        Plotly.newPlot(chartRef.current, [starTrace as any, orbitTrace as any, planetTrace as any], layout, config);

        let angle = 0;
        const speed = 360 / (safePeriod * 60); 

        const animate = () => {
            angle = (angle + speed) % 360;
            const rad = angle * (Math.PI / 180);
            const update = { x: [[orbitRadius * Math.cos(rad)]], y: [[orbitRadius * Math.sin(rad)]] };
            if(chartRef.current){
                Plotly.restyle(chartRef.current, update, [2]);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animate();

        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };

    }, [profile]);

    return (
        <div className="bg-space-blue/50 p-2 rounded-lg shadow-md border border-space-light backdrop-blur-sm h-full flex flex-col justify-center items-center">
            <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '300px' }}></div>
        </div>
    );
};

export default PlanetVisualizer;
