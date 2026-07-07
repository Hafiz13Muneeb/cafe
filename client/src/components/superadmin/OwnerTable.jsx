import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Edit, Trash2, Users, Bell } from 'lucide-react';

const OwnerTable = ({ owners, loading, onToggleBlock, onEdit, onDelete }) => {
  if (loading) return <div className="p-8 text-center font-bold" style={{ color: 'var(--text-color)' }}>Loading owners...</div>;

  return (
    <div className="overflow-x-auto border-2 border-[#3E2723]" style={{ backgroundColor: 'var(--card-bg)' }}>
      <table className="w-full">
        <thead style={{ backgroundColor: 'var(--secondary-color)' }}>
          <tr>
            {['Cafe', 'Username', 'Email', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-bold uppercase text-xs" style={{ color: 'var(--text-color)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#3E2723]">
          {owners.map((owner) => (
            <tr 
              key={owner._id} 
              className="transition"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td className="px-4 py-3 font-bold" style={{ color: 'var(--text-color)' }}>
                <Link to={`/admin/super/${owner.slug}`} className="hover:underline flex items-center gap-2">
                  {owner.activeReminders > 0 && <Bell size={14} className="text-red-600 animate-pulse" />}
                  {owner.cafeName}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-color)' }}>{owner.username}</td>
              <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-color)' }}>{owner.email}</td>
              <td className="px-4 py-3">
                <span 
                  className={`px-2 py-1 font-bold text-xs border-2 border-[#3E2723] ${
                    owner.isBlocked ? 'bg-red-300' : 'text-white'
                  }`}
                  style={owner.isBlocked ? {} : { backgroundColor: 'var(--primary-color)' }}
                >
                  {owner.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-1">
                <button 
                  onClick={() => onToggleBlock(owner._id, owner.isBlocked)} 
                  className="p-1.5 border-2 border-[#3E2723] transition"
                  style={{ backgroundColor: 'transparent', color: 'var(--text-color)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => onEdit(owner)} 
                  className="p-1.5 border-2 border-[#3E2723] transition"
                  style={{ backgroundColor: 'transparent', color: 'var(--text-color)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => onDelete(owner._id)} 
                  className="p-1.5 border-2 border-[#3E2723] transition hover:bg-red-400"
                  style={{ backgroundColor: 'transparent', color: 'var(--text-color)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f87171'} /* red-400 */
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerTable;