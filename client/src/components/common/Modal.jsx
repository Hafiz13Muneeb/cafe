import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', full: 'max-w-4xl' };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E2723]/40 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <div 
        className={`border-4 border-[#3E2723] p-4 sm:p-6 w-full ${sizeClasses[size] || 'max-w-md'}`}
        style={{
          backgroundColor: 'var(--card-bg)',
          boxShadow: "6px 6px 0px 0px var(--primary-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 p-1 border-2 border-[#3E2723] transition"
            style={{
              backgroundColor: 'var(--card-bg)',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-color)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card-bg)'}
          >
            <X size={18} className="sm:w-5 sm:h-5" style={{ color: 'var(--text-color)' }} />
          </button>
        )}
        {title && (
          <h2 
            className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 font-['Permanent_Marker']"
            style={{ color: 'var(--text-color)' }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;