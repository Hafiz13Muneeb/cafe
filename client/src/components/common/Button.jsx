import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  const baseStyle = "font-bold transition-all border-2 border-[#3E2723] active:translate-y-1";
  const variants = {
    primary: "bg-[#8A9A5B] text-white",
    secondary: "bg-[#EAE0C8] text-[#3E2723]",
    danger: "bg-red-400 text-white",
    outline: "bg-transparent text-[#3E2723]"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${widthClass} ${className} ${size === 'lg' ? 'px-6 py-3' : 'px-4 py-2'}`}
      style={{ boxShadow: "4px 4px 0px 0px #3E2723" }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;