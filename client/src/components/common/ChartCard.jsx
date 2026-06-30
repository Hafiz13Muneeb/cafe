import React from 'react';

const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white border-2 border-[#3E2723] p-4" style={{ boxShadow: "6px 6px 0px 0px #EAE0C8" }}>
      {title && <h3 className="text-md font-bold text-[#3E2723]">{title}</h3>}
      {subtitle && <p className="text-xs text-[#3E2723]/60 mb-2">{subtitle}</p>}
      {children}
    </div>
  );
};
export default ChartCard;