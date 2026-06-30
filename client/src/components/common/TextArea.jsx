import React from 'react';

const TextArea = ({ label, name, value, onChange, rows = 3, required = false, placeholder = '', className = '', error = '', ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-bold text-[#3E2723] mb-1">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name} name={name} value={value} onChange={onChange} rows={rows} required={required} placeholder={placeholder}
        className={`w-full px-3 py-2 border-2 border-[#3E2723] bg-white focus:outline-none ${error ? 'border-red-500' : ''}`}
        style={{ boxShadow: "4px 4px 0px 0px #3E2723" }} {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500 font-bold">{error}</p>}
    </div>
  );
};
export default TextArea;