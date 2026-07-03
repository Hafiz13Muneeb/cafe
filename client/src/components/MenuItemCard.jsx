import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';

const MenuItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div
      className="group bg-white border-2 border-[#3E2723] overflow-hidden transition-all hover:shadow-[8px_8px_0px_0px_#8A9A5B] hover:-translate-y-1"
      style={{ boxShadow: '4px 4px 0px 0px #EAE0C8' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F5DC]">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-[#3E2723]/60 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold px-2 sm:px-3 py-1 border-2 border-[#3E2723] text-[10px] sm:text-xs uppercase">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 space-y-1">
        <h3 className="font-bold text-xs sm:text-sm truncate">{item.title}</h3>
        {item.description && (
          <p className="text-[10px] sm:text-xs text-[#3E2723]/60 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm sm:text-base font-bold text-[#8A9A5B]">${item.price}</span>
          <button
            onClick={() => addToCart(item)}
            disabled={!item.isAvailable}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#3E2723] bg-[#8A9A5B] text-white font-bold transition-all hover:bg-[#3E2723] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#8A9A5B]"
          >
            <Plus size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;