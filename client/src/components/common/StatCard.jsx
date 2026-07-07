import React from 'react';

const StatCard = ({ icon: Icon, label, value, suffix = '', prefix = '' }) => {
  return (
    <div 
      className="border-2 border-[#3E2723] p-3 sm:p-4"
      style={{
        backgroundColor: 'var(--card-bg)',
        boxShadow: "4px 4px 0px 0px var(--primary-color)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p 
            className="text-[10px] sm:text-sm font-bold truncate"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </p>
          <p 
            className="text-base sm:text-2xl font-bold truncate"
            style={{ color: 'var(--text-color)' }}
          >
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        {Icon && (
          <div 
            className="p-1.5 sm:p-2 border-2 border-[#3E2723] flex-shrink-0"
            style={{
              backgroundColor: 'var(--secondary-color)',
              color: 'var(--text-color)',
            }}
          >
            <Icon size={16} className="sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;