// src/components/superadmin/OwnerTable.jsx - Table of cafe owners with actions
import React from 'react';
import { Eye, EyeOff, Edit, Trash2, Users } from 'lucide-react';

const OwnerTable = ({ owners, loading, onToggleBlock, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-primary border-t-transparent" style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}></div>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading owners...</p>
      </div>
    );
  }

  if (owners.length === 0) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
        <Users size={40} className="mx-auto mb-2" style={{ color: 'var(--border-color)' }} />
        <p>No cafe owners registered yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cafe</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {owners.map((owner) => (
            <tr key={owner._id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-color)' }}>{owner.cafeName || '—'}</td>
              <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{owner.username}</td>
              <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{owner.email}</td>
              <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{owner.slug || '—'}</td>
              <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{owner.whatsappNumber || '—'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  owner.isBlocked
                    ? 'bg-red-100 text-red-700'
                    : 'bg-primary/20 text-primary border border-primary/30'
                }`}>
                  {owner.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onToggleBlock(owner._id, owner.isBlocked)}
                    className={`p-1.5 rounded-lg transition ${
                      owner.isBlocked ? 'hover:bg-primary/20 text-primary' : 'hover:bg-red-50 text-red-600'
                    }`}
                    title={owner.isBlocked ? 'Unblock' : 'Block'}
                  >
                    {owner.isBlocked ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => onEdit(owner)}
                    className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(owner._id)}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                    title="Delete"
                  >
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

export default OwnerTable;