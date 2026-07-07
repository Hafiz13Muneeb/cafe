import React from 'react';

const PeriodFilter = ({ periods, selected, onSelect }) => {
  return (
    <div 
      className="flex gap-0.5 sm:gap-1 border-2 border-[#3E2723] p-1 w-max overflow-x-auto max-w-full"
      style={{ backgroundColor: 'var(--secondary-color)' }}
    >
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onSelect(period.value)}
          className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap"
          style={{
            backgroundColor: selected === period.value ? 'var(--primary-color)' : 'transparent',
            color: selected === period.value ? '#ffffff' : 'var(--text-color)',
            border: selected === period.value ? '2px solid #3E2723' : '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (selected !== period.value) {
              e.target.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== period.value) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodFilter;