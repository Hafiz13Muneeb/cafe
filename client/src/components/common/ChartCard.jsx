import React from 'react';

const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white border-2 border-[#3E2723] p-3 sm:p-4" style={{ boxShadow: "4px 4px 0px 0px #EAE0C8" }}>
      {title && <h3 className="text-sm sm:text-md font-bold text-[#3E2723]">{title}</h3>}
      {subtitle && <p className="text-[10px] sm:text-xs text-[#3E2723]/60 mb-1 sm:mb-2">{subtitle}</p>}
      {children}
    </div>
  );
};
export default ChartCard;