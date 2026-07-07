import React from 'react';

const Input = ({
  label, name, value, onChange, type = 'text', required = false,
  placeholder = '', className = '', error = '', leftIcon: LeftIcon, rightIcon: RightIcon, ...props
}) => {
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
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <LeftIcon size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 focus:outline-none transition-all ${
            LeftIcon ? 'pl-8 sm:pl-10' : ''
          } ${error ? 'border-red-500' : 'border-[#3E2723]'}`}
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            boxShadow: "3px 3px 0px 0px #3E2723",
          }}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
            <RightIcon size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs sm:text-sm text-red-500 font-bold">{error}</p>}
    </div>
  );
};

export default Input;