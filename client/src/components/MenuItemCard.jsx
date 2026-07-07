import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { Plus } from 'lucide-react';

const MenuItemCard = ({ item, currency = 'Rs' }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(item));
  };

  return (
    <div
      className="group border-2 border-[#3E2723] overflow-hidden transition-all hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--card-bg)',
        boxShadow: '4px 4px 0px 0px var(--secondary-color)',
        hover: {
          boxShadow: '8px 8px 0px 0px var(--primary-color)',
        },
      }}
    >
      {/* Image */}
      <div 
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
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
        <h3 
          className="font-bold text-xs sm:text-sm truncate"
          style={{ color: 'var(--text-color)' }}
        >
          {item.title}
        </h3>
        {item.description && (
          <p 
            className="text-[10px] sm:text-xs line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span 
            className="text-sm sm:text-base font-bold"
            style={{ color: 'var(--primary-color)' }}
          >
            {currency}{item.price}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#3E2723] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              if (item.isAvailable) {
                e.target.style.backgroundColor = '#3E2723';
              }
            }}
            onMouseLeave={(e) => {
              if (item.isAvailable) {
                e.target.style.backgroundColor = 'var(--primary-color)';
              }
            }}
          >
            <Plus size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;