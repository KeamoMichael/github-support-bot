import React from 'react';
import { KPIStats } from '../types';

interface KPIGridProps {
  stats: KPIStats;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KPICard label="Docs Searched" value={stats.docsSearched.toString()} unit="" />
      <KPICard label="Avg. Response Delay" value={stats.avgResponseTime} unit="" />
      <KPICard label="Documentation Match" value={stats.accuracy} unit="" />
      <KPICard label="Active Contexts" value={stats.activeContexts.toString()} unit="" />
    </div>
  );
};

const KPICard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-white p-5 rounded-[2rem] shadow-sm flex flex-col justify-center min-h-[100px]">
    <span className="text-gray-400 text-sm font-medium mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      <span className="text-gray-500 text-sm font-medium">{unit}</span>
    </div>
  </div>
);
