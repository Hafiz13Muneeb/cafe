// src/components/common/TextArea.jsx - Reusable textarea
import React from 'react';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  required = false,
  placeholder = '',
  className = '',
  error = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-2'}
        `}
        style={{ '--tw-ring-color': error ? '#ef4444' : 'var(--primary-color)' }}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TextArea;