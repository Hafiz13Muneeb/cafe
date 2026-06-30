import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Edit, Trash2, Users, Bell } from 'lucide-react';

const OwnerTable = ({ owners, loading, onToggleBlock, onEdit, onDelete }) => {
  if (loading) return <div className="p-8 text-center font-bold text-[#3E2723]">Loading owners...</div>;

  return (
    <div className="overflow-x-auto border-2 border-[#3E2723] bg-white">
      <table className="w-full">
        <thead className="bg-[#EAE0C8]">
          <tr>
            {['Cafe', 'Username', 'Email', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-bold text-[#3E2723] uppercase text-xs">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#3E2723]">
          {owners.map((owner) => (
            <tr key={owner._id} className="hover:bg-[#F5F5DC] transition">
              <td className="px-4 py-3 font-bold text-[#3E2723]">
                <Link to={`/admin/super/${owner.slug}`} className="hover:underline flex items-center gap-2">
                  {owner.activeReminders > 0 && <Bell size={14} className="text-red-600 animate-pulse" />}
                  {owner.cafeName}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm">{owner.username}</td>
              <td className="px-4 py-3 text-sm">{owner.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 font-bold text-xs border-2 border-[#3E2723] ${owner.isBlocked ? 'bg-red-300' : 'bg-[#8A9A5B] text-white'}`}>
                  {owner.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-1">
                <button onClick={() => onToggleBlock(owner._id, owner.isBlocked)} className="p-1.5 border-2 border-[#3E2723] hover:bg-[#EAE0C8]"><Eye size={16} /></button>
                <button onClick={() => onEdit(owner)} className="p-1.5 border-2 border-[#3E2723] hover:bg-[#EAE0C8]"><Edit size={16} /></button>
                <button onClick={() => onDelete(owner._id)} className="p-1.5 border-2 border-[#3E2723] hover:bg-red-400"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default OwnerTable;