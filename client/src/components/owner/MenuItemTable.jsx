// src/components/owner/MenuItemTable.jsx - Menu items table with actions
import React from 'react';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const MenuItemTable = ({ items, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-primary border-t-transparent" style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}></div>
        <p className="mt-2 text-gray-500">Loading items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <ImageIcon size={40} className="mx-auto text-gray-300 mb-2" />
        <p>No menu items yet. Click "Add New" to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => (
            <tr key={item._id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3">
                <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">{item.title}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-800">Rs. {item.price}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${item.isAvailable ? 'bg-primary/20 text-primary border-primary/30' : 'bg-red-100 text-red-700 border-red-200'}`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => onDelete(item._id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition">
                    <Trash2 size={16} />
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