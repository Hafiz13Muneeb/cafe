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
  const baseStyle = "font-bold transition-all border-2 border-[var(--border-color)] active:translate-y-1";
  const variants = {
    primary: "bg-primary text-white",
    secondary: "bg-[var(--bg-color)] text-[var(--text-color)]",
    danger: "bg-red-400 text-white",
    outline: "bg-transparent text-[var(--text-color)]"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${widthClass} ${className} ${size === 'lg' ? 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base' : 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base'}`}
      style={{ boxShadow: "3px 3px 0px 0px var(--border-color)" }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;