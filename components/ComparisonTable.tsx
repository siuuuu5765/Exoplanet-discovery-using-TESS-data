import React from 'react';
import type { PlanetAnalysis } from '../types';

interface ComparisonTableProps {
  foundPlanet: PlanetAnalysis['planet'];
}

const knownPlanet = {
  name: 'Earth',
  period: 365.25,
  radius: 1.0,
  semiMajorAxis: 1.0,
  type: 'Terrestrial',
};

const ComparisonTable: React.FC<ComparisonTableProps> = ({ foundPlanet }) => {
    const data = [
        { parameter: 'Orbital Period (days)', found: foundPlanet.period.toFixed(2), known: knownPlanet.period.toFixed(2) },
        { parameter: 'Radius (Earths)', found: foundPlanet.radius.toFixed(2), known: knownPlanet.radius.toFixed(2) },
        { parameter: 'Semi-Major Axis (AU)', found: foundPlanet.semiMajorAxis.toFixed(3), known: knownPlanet.semiMajorAxis.toFixed(3) },
    ];
    
    return (
        <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
            <h3 className="text-lg font-bold font-display text-accent-cyan mb-4 text-center">Comparison to Earth</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-accent-gold uppercase bg-space-light/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Parameter
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                {foundPlanet.name}
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                {knownPlanet.name}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                             <tr key={row.parameter} className="border-b border-space-light/50">
                                <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                                    {row.parameter}
                                </th>
                                <td className="px-6 py-4 text-center font-mono">
                                    {row.found}
                                </td>
                                <td className="px-6 py-4 text-center font-mono">
                                    {row.known}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonTable;
