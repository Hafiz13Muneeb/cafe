// src/components/common/Button.jsx - Reusable button component
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
  // Variant styles
  const variantStyles = {
    primary: {
      bg: 'var(--primary-color)',
      text: 'text-white',
      hover: 'hover:opacity-90',
      shadow: 'shadow-md',
      border: 'border-transparent',
    },
    secondary: {
      bg: 'bg-gray-200',
      text: 'text-gray-700',
      hover: 'hover:bg-gray-300',
      shadow: '',
      border: 'border-gray-300',
    },
    danger: {
      bg: 'bg-red-500',
      text: 'text-white',
      hover: 'hover:bg-red-600',
      shadow: 'shadow-md',
      border: 'border-transparent',
    },
    outline: {
      bg: 'bg-transparent',
      text: 'text-primary',
      hover: 'hover:bg-primary/10',
      shadow: '',
      border: 'border-primary',
    },
  };

  const variantStyle = variantStyles[variant] || variantStyles.primary;

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${sizeStyle}
        ${variantStyle.text}
        ${variantStyle.hover}
        ${variantStyle.shadow}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        backgroundColor: variant === 'primary' ? 'var(--primary-color)' : variantStyle.bg,
        border: `1px solid ${variant === 'outline' ? 'var(--primary-color)' : variantStyle.border}`,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;