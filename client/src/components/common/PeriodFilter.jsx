import React from 'react';

const PeriodFilter = ({ periods, selected, onSelect }) => {
  return (
    <div className="flex gap-0.5 sm:gap-1 bg-[var(--bg-color)] border-2 border-[var(--border-color)] p-1 w-max overflow-x-auto max-w-full">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onSelect(period.value)}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            selected === period.value
              ? 'bg-primary text-white border-2 border-[var(--border-color)]'
              : 'text-[var(--text-color)] hover:bg-[var(--text-color)]/10'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};
export default PeriodFilter;