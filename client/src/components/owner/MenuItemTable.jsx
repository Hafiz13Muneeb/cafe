import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const MenuItemTable = ({ items, loading, onEdit, onDelete }) => {
  if (loading) return <div className="p-8 text-center font-bold text-[#3E2723]">Loading items...</div>;

  return (
    <div className="overflow-x-auto border-2 border-[#3E2723] bg-white">
      <table className="w-full min-w-[600px] text-sm sm:text-base">
        <thead className="bg-[#EAE0C8]">
          <tr>
            {['Image', 'Title', 'Category', 'Price', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#3E2723] text-xs sm:text-sm">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#3E2723]">
          {items.map(item => (
            <tr key={item._id} className="hover:bg-[#F5F5DC] transition">
              <td className="px-2 sm:px-4 py-2">
                <img src={item.imageUrl} className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#3E2723] object-cover" alt={item.title} />
              </td>
              <td className="px-2 sm:px-4 py-2 font-bold text-[#3E2723] text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{item.title}</td>
              <td className="px-2 sm:px-4 py-2 text-[#3E2723] text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none">{item.category}</td>
              <td className="px-2 sm:px-4 py-2 font-bold text-[#3E2723] text-xs sm:text-sm">Rs. {item.price}</td>
              <td className="px-2 sm:px-4 py-2">
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold border-2 border-[#3E2723] text-[10px] sm:text-xs whitespace-nowrap ${
                  item.isAvailable ? 'bg-[#8A9A5B] text-white' : 'bg-red-300'
                }`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="px-2 sm:px-4 py-2">
                <div className="flex gap-1 sm:gap-2">
                  <button onClick={() => onEdit(item)} className="p-1 sm:p-2 border-2 border-[#3E2723] hover:bg-[#8A9A5B] transition">
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => onDelete(item._id)} className="p-1 sm:p-2 border-2 border-[#3E2723] hover:bg-red-400 transition">
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MenuItemTable;