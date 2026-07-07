import React from 'react';

const TextArea = ({ label, name, value, onChange, rows = 3, required = false, placeholder = '', className = '', error = '', ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-xs sm:text-sm font-bold mb-1"
          style={{ color: 'var(--text-color)' }}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
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
        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 focus:outline-none ${
          error ? 'border-red-500' : 'border-[#3E2723]'
        }`}
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
          boxShadow: "3px 3px 0px 0px #3E2723",
        }}
        {...props}
      />
      {error && <p className="mt-1 text-xs sm:text-sm text-red-500 font-bold">{error}</p>}
    </div>
  );
};

export default TextArea;