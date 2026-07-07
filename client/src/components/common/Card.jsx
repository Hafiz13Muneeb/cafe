import React from 'react';

const Card = ({ children, title, subtitle, className = '' }) => {
  return (
    <div 
      className={`border-2 border-[#3E2723] p-4 sm:p-6 ${className}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-color)',
        boxShadow: "6px 6px 0px 0px var(--primary-color)",
      }}
    >
      {title && (
        <h3 
          className="text-xl sm:text-2xl font-bold mb-1"
          style={{ 
            fontFamily: "'Permanent Marker', cursive",
            color: 'var(--text-color)',
          }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p 
          className="text-xs sm:text-sm mb-3 sm:mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

export default Card;