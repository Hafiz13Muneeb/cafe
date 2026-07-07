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

  // ✅ Use CSS variables for dynamic theming
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary-color)',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: 'var(--secondary-color)',
      color: 'var(--text-color)',
    },
    danger: {
      backgroundColor: '#f87171', // red-400
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-color)',
      borderColor: 'var(--border-color)',
    },
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const sizeClass = size === 'lg' 
    ? 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base'
    : 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${widthClass} ${sizeClass} ${className}`}
      style={{
        ...variantStyles[variant],
        boxShadow: "3px 3px 0px 0px #3E2723",
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;