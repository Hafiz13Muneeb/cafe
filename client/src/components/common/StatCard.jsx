import React from 'react';

const StatCard = ({ icon: Icon, label, value, suffix = '', prefix = '' }) => {
  return (
    <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-3 sm:p-4" style={{ boxShadow: "4px 4px 0px 0px var(--primary-color)" }}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-sm font-bold text-[var(--text-color)]/70 truncate">{label}</p>
          <p className="text-base sm:text-2xl font-bold text-[var(--text-color)] truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        {Icon && (
          <div className="p-1.5 sm:p-2 border-2 border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] flex-shrink-0">
            <Icon size={16} className="sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
export default StatCard;