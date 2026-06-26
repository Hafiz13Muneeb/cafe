// src/components/MenuItemCard.jsx - Menu item card with dynamic theming
import React from 'react';
import { useCart } from '../context/CartContext';

const MenuItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div 
      className="rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--bg-color)' }}>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-full text-xs">Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-color)' }}>
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary, #64748b)' }}>
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold" style={{ color: 'var(--primary-color)' }}>
            Rs. {item.price}
          </span>
          <button
            onClick={() => addToCart(item)}
            disabled={!item.isAvailable}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: item.isAvailable ? 'var(--primary-color)' : 'var(--border-color)',
              color: item.isAvailable ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
              cursor: item.isAvailable ? 'pointer' : 'not-allowed',
              boxShadow: item.isAvailable ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (item.isAvailable) {
                e.target.style.opacity = '0.85';
              }
            }}
            onMouseLeave={(e) => {
              if (item.isAvailable) {
                e.target.style.opacity = '1';
              }
            }}
          >
            {item.isAvailable ? 'Add +' : 'Sold'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;