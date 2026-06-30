import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const MenuItemTable = ({ items, loading, onEdit, onDelete }) => {
  if (loading) return <div className="p-8 text-center font-bold text-[#3E2723]">Loading items...</div>;

  return (
    <div className="overflow-x-auto border-2 border-[#3E2723] bg-white">
      <table className="w-full">
        <thead className="bg-[#EAE0C8]">
          <tr>
            {['Image', 'Title', 'Category', 'Price', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-bold text-[#3E2723]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#3E2723]">
          {items.map(item => (
            <tr key={item._id} className="hover:bg-[#F5F5DC] transition">
              <td className="px-4 py-2"><img src={item.imageUrl} className="w-10 h-10 border-2 border-[#3E2723]" /></td>
              <td className="px-4 py-2 font-bold text-[#3E2723]">{item.title}</td>
              <td className="px-4 py-2 text-[#3E2723]">{item.category}</td>
              <td className="px-4 py-2 font-bold text-[#3E2723]">Rs. {item.price}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 font-bold border-2 border-[#3E2723] ${item.isAvailable ? 'bg-[#8A9A5B] text-white' : 'bg-red-300'}`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button onClick={() => onEdit(item)} className="p-2 border-2 border-[#3E2723] hover:bg-[#8A9A5B]"><Edit size={16} /></button>
                <button onClick={() => onDelete(item._id)} className="p-2 border-2 border-[#3E2723] hover:bg-red-400"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MenuItemTable;