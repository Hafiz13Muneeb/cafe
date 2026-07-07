import React from 'react';

const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div 
      className="border-2 border-[#3E2723] p-3 sm:p-4"
      style={{
        backgroundColor: 'var(--card-bg)',
        boxShadow: "4px 4px 0px 0px var(--secondary-color)",
      }}
    >
      {title && (
        <h3 
          className="text-sm sm:text-md font-bold"
          style={{ color: 'var(--text-color)' }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p 
          className="text-[10px] sm:text-xs mb-1 sm:mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

export default ChartCard;