import React from 'react';

const Input = ({
  label, name, value, onChange, type = 'text', required = false,
  placeholder = '', className = '', error = '', leftIcon: LeftIcon, rightIcon: RightIcon, ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-bold text-[#3E2723] mb-1">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LeftIcon size={18} className="text-[#3E2723]" /></div>}
        <input
          id={name} name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
          className={`w-full px-3 py-2 border-2 border-[#3E2723] bg-white focus:outline-none transition-all ${LeftIcon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
          style={{ boxShadow: "4px 4px 0px 0px #3E2723" }}
          {...props}
        />
        {RightIcon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><RightIcon size={18} className="text-[#3E2723]" /></div>}
      </div>
      {error && <p className="mt-1 text-sm text-red-500 font-bold">{error}</p>}
    </div>
  );
};
export default Input;