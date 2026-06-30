import React from 'react';

const StatCard = ({ icon: Icon, label, value, suffix = '', prefix = '' }) => {
  return (
    <div className="bg-white border-2 border-[#3E2723] p-3 sm:p-4" style={{ boxShadow: "4px 4px 0px 0px #8A9A5B" }}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-sm font-bold text-[#3E2723]/70 truncate">{label}</p>
          <p className="text-base sm:text-2xl font-bold text-[#3E2723] truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        {Icon && (
          <div className="p-1.5 sm:p-2 border-2 border-[#3E2723] bg-[#EAE0C8] text-[#3E2723] flex-shrink-0">
            <Icon size={16} className="sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
export default StatCard;