// src/components/common/Modal.jsx - Reusable modal
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`
          bg-white rounded-2xl shadow-2xl p-6 mx-4 relative
          animate-scale-up w-full ${sizeClasses[size] || 'max-w-md'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-500 hover:text-gray-700" />
          </button>
        )}
        {title && (
          <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;