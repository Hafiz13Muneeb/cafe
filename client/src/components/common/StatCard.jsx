// src/components/common/StatCard.jsx - Reusable stat card
import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'primary', suffix = '', prefix = '' }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        {Icon && (
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;