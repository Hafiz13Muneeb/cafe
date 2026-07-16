import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';

const MenuItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div
      className="group bg-[var(--card-bg)] border-2 border-[var(--border-color)] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--primary-color)]"
      style={{ boxShadow: '4px 4px 0px 0px var(--border-color)' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--bg-color)]">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-[var(--border-color)]/60 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold px-2 sm:px-3 py-1 border-2 border-[var(--border-color)] text-[10px] sm:text-xs uppercase">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 space-y-1">
        <h3 className="font-bold text-xs sm:text-sm truncate text-[var(--text-color)]">{item.title}</h3>
        {item.description && (
          <p className="text-[10px] sm:text-xs text-[var(--text-color)]/60 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm sm:text-base font-bold text-primary">${item.price}</span>
          <button
            onClick={() => addToCart(item)}
            disabled={!item.isAvailable}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border-2 border-[var(--border-color)] bg-primary text-white font-bold transition-all hover:bg-[var(--border-color)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            <Plus size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;