import React from 'react';

const PeriodFilter = ({ periods, selected, onSelect }) => {
  return (
    <div className="flex gap-1 bg-[#EAE0C8] border-2 border-[#3E2723] p-1 w-max">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onSelect(period.value)}
          className={`px-3 py-1 text-xs font-bold transition-all ${
            selected === period.value
              ? 'bg-[#8A9A5B] text-white border-2 border-[#3E2723]'
              : 'text-[#3E2723] hover:bg-[#3E2723]/10'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};
export default PeriodFilter;