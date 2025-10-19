
import React from 'react';

interface DataCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({ title, value, icon }) => (
  <div className="bg-space-blue/50 p-4 rounded-lg shadow-md border border-space-light backdrop-blur-sm">
    <h4 className="text-sm text-gray-400 font-semibold flex items-center">{icon}{title}</h4>
    <p className="text-xl font-bold text-gray-100">{value}</p>
  </div>
);

export default DataCard;
