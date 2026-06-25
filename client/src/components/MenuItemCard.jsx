// src/components/MenuItemCard.jsx - Light theme item card
import React from 'react';
import { useCart } from '../context/CartContext';

const MenuItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
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
        <h3 className="font-semibold text-slate-900 text-sm truncate">{item.title}</h3>
        {item.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary">Rs. {item.price}</span>
          <button
            onClick={() => addToCart(item)}
            disabled={!item.isAvailable}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              item.isAvailable
                ? 'bg-primary text-white hover:opacity-90 active:scale-95 shadow-md shadow-primary/20'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {item.isAvailable ? 'Add +' : 'Sold'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;