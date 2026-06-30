// src/components/CategoryFilter.jsx - Category filter with dynamic theming
import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const formatCategory = (cat) => cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);

  return (
    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200"
          style={{
            backgroundColor: selectedCategory === category 
              ? 'var(--primary-color)' 
              : 'var(--card-bg)',
            color: selectedCategory === category 
              ? '#ffffff' 
              : 'var(--text-color)',
            border: selectedCategory === category 
              ? 'none' 
              : '1px solid var(--border-color)',
            boxShadow: selectedCategory === category 
              ? '0 4px 15px rgba(0,0,0,0.15)' 
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (selectedCategory !== category) {
              e.target.style.backgroundColor = 'var(--primary-light)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== category) {
              e.target.style.backgroundColor = 'var(--card-bg)';
            }
          }}
        >
          {formatCategory(category)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;