// src/components/CartFloatingButton.jsx - Floating cart button with dynamic theming
import React from 'react';
import { ShoppingCart } from 'lucide-react';

const CartFloatingButton = ({ totalItems, totalPrice, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 rounded-full shadow-xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm sm:text-base"
      style={{
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      }}
    >
      <div className="relative">
        <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px]" />
        <span 
          className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-dot"
        >
          {totalItems}
        </span>
      </div>
      <span className="font-medium hidden xs:inline">View Cart</span>
      <span className="text-sm opacity-90 hidden xs:inline">•</span>
      <span className="font-semibold">Rs. {totalPrice}</span>
    </button>
  );
};

export default CartFloatingButton;