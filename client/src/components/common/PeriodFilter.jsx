// src/components/common/PeriodFilter.jsx - Period filter buttons
import React from 'react';

const PeriodFilter = ({ periods, selected, onSelect }) => {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onSelect(period.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            selected === period.value
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodFilter;