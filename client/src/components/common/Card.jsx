import React from 'react';

const Card = ({ children, title, subtitle, className = '' }) => {
  return (
    <div className={`bg-white border-2 border-[#3E2723] p-6 ${className}`} style={{ boxShadow: "8px 8px 0px 0px #8A9A5B" }}>
      {title && <h3 className="text-xl font-bold text-[#3E2723] mb-1" style={{ fontFamily: "'Permanent Marker', cursive" }}>{title}</h3>}
      {subtitle && <p className="text-sm text-[#3E2723]/70 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
};
export default Card;