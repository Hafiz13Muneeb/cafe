// src/components/CategoryFilter.jsx - Light theme category filter
import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const formatCategory = (cat) => cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            selectedCategory === category
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {formatCategory(category)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;