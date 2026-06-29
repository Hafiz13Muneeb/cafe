// src/components/common/Card.jsx
import React from 'react';

const Card = ({ children, title, subtitle, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft p-6 border border-gray-100 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-3">{subtitle}</p>}
      {children}
    </div>
  );
};

export default Card;