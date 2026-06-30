import React from 'react';

const StatCard = ({ icon: Icon, label, value, suffix = '', prefix = '' }) => {
  return (
    <div className="bg-white border-2 border-[#3E2723] p-4" style={{ boxShadow: "6px 6px 0px 0px #8A9A5B" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#3E2723]/70">{label}</p>
          <p className="text-2xl font-bold text-[#3E2723]">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        {Icon && (
          <div className="p-2 border-2 border-[#3E2723] bg-[#EAE0C8] text-[#3E2723]">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
};
export default StatCard;