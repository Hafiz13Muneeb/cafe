// src/components/analytics/ChartTypeSelector.jsx
import React from 'react';
import { BarChart3, LineChart as LineChartIcon, PieChart } from 'lucide-react';

const CHART_TYPES = [
  { value: 'line', label: 'Line', icon: LineChartIcon },
  { value: 'bar', label: 'Bar', icon: BarChart3 },
  { value: 'pie', label: 'Pie', icon: PieChart },
];

const ChartTypeSelector = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-1 bg-[#EAE0C8] border-2 border-[#3E2723] p-1 w-max">
      {CHART_TYPES.map((type) => {
        const Icon = type.icon;
        return (
          <button
            key={type.value}
            onClick={() => onSelect(type.value)}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold transition-all ${
              selected === type.value
                ? 'bg-[#8A9A5B] text-white border-2 border-[#3E2723]'
                : 'text-[#3E2723] hover:bg-[#3E2723]/10'
            }`}
          >
            <Icon size={14} className="sm:w-4 sm:h-4" />
            <span>{type.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChartTypeSelector;