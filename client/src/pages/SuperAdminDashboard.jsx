// src/pages/SuperAdminDashboard.jsx - Superadmin panel
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Plus,
  Edit,
  Trash2,
  X,
  LogOut,
  Users,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if not superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isSuperAdmin, navigate]);

  // State
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    cafeName: '',
    temporaryPassword: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Edit form
  const [editFormData, setEditFormData] = useState({
    cafeName: '',
    whatsappNumber: '',
    tables: '',
    primaryColor: '#d4a843',
    secondaryColor: '#b8860b',
    mode: 'light',
  });

  // Fetch owners on mount
  useEffect(() => {
    fetchOwners();
  }, []);

  // Auto-clear success after 3s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/owners');
      if (response.data.success) {
        setOwners(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
      setError(err.response?.data?.message || 'Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // --- Add Owner ---
  const handleAddOwner = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/auth/create-owner', formData);
      if (response.data.success) {
        const newOwner = response.data.data.user;
        const tempPassword = response.data.data.temporaryPassword;
        setOwners(prev => [newOwner, ...prev]);
        setIsAddModalOpen(false);
        setFormData({ username: '', email: '', cafeName: '', temporaryPassword: '' });
        setSuccess(`Owner created! Temporary password: ${tempPassword} (copy it now)`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create owner');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Toggle Block ---
  const handleToggleBlock = async (ownerId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this owner?`)) return;
    try {
      setError('');
      const response = await api.put(`/users/owners/${ownerId}/toggle-block`);
      if (response.data.success) {
        setOwners(prev => prev.map(o =>
          o._id === ownerId ? { ...o, isBlocked: !o.isBlocked } : o
        ));
        setSuccess(`Owner ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle block status');
    }
  };

  // --- Delete Owner ---
  const handleDelete = async (ownerId) => {
    if (!window.confirm('Are you sure you want to permanently delete this owner? This cannot be undone.')) return;
    try {
      setError('');
      const response = await api.delete(`/users/owners/${ownerId}`);
      if (response.data.success) {
        setOwners(prev => prev.filter(o => o._id !== ownerId));
        setSuccess('Owner deleted successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete owner');
    }
  };

  // --- Open Edit Modal ---
  const openEditModal = (owner) => {
    setSelectedOwner(owner);
    setEditFormData({
      cafeName: owner.cafeName || '',
      whatsappNumber: owner.whatsappNumber || '',
      tables: (owner.tables || []).join(', '),
      primaryColor: owner.theme?.primaryColor || '#d4a843',
      secondaryColor: owner.theme?.secondaryColor || '#b8860b',
      mode: owner.theme?.mode || 'light',
    });
    setIsEditModalOpen(true);
  };

  // --- Update Owner ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        cafeName: editFormData.cafeName.trim(),
        whatsappNumber: editFormData.whatsappNumber.trim(),
        tables: editFormData.tables.split(',').map(t => t.trim()).filter(t => t.length > 0),
        theme: {
          primaryColor: editFormData.primaryColor,
          secondaryColor: editFormData.secondaryColor,
          mode: editFormData.mode,
        },
      };
      const response = await api.put(`/users/owners/${selectedOwner._id}`, payload);
      if (response.data.success) {
        setOwners(prev => prev.map(o =>
          o._id === selectedOwner._id ? response.data.data : o
        ));
        setIsEditModalOpen(false);
        setSelectedOwner(null);
        setSuccess('Owner updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update owner');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Form input handlers ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={24} style={{ color: 'var(--primary-color)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Super Admin</h1>
            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>Control Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOwners}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Error / Success messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg text-sm flex items-start gap-2" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Header with Add button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Cafe Owners</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage all registered cafe owners</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-md transition hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Plus size={18} />
            Add Owner
          </button>
        </div>

        {/* Owners Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-t-transparent" style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}></div>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading owners...</p>
            </div>
          ) : owners.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              <Users size={40} className="mx-auto mb-2" style={{ color: 'var(--border-color)' }} />
              <p>No cafe owners registered yet.</p>
            </div>
          ) : (
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
                            onClick={() => handleToggleBlock(owner._id, owner.isBlocked)}
                            className={`p-1.5 rounded-lg transition ${
                              owner.isBlocked ? 'hover:bg-primary/20 text-primary' : 'hover:bg-red-50 text-red-600'
                            }`}
                            title={owner.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {owner.isBlocked ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => openEditModal(owner)}
                            className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(owner._id)}
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
          )}
        </div>
      </div>

      {/* --- Add Owner Modal --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-float p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>Add New Cafe Owner</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={22} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddOwner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Cafe Name *</label>
                <input
                  type="text"
                  name="cafeName"
                  value={formData.cafeName}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Temporary Password (optional)</label>
                <input
                  type="text"
                  name="temporaryPassword"
                  value={formData.temporaryPassword}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  placeholder="Leave blank to auto-generate"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Min 6 characters. If left blank, a secure password will be generated.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg shadow-md transition disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {formLoading ? 'Creating...' : 'Create Owner'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Owner Modal --- */}
      {isEditModalOpen && selectedOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-float p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>Edit Owner: {selectedOwner.cafeName}</h3>
              <button
                onClick={() => { setIsEditModalOpen(false); setSelectedOwner(null); }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={22} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Cafe Name *</label>
                <input
                  type="text"
                  name="cafeName"
                  value={editFormData.cafeName}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={editFormData.whatsappNumber}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  placeholder="e.g., 923001234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Tables (comma-separated)</label>
                <input
                  type="text"
                  name="tables"
                  value={editFormData.tables}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  placeholder="e.g., 1, 2, 3, VIP, Patio"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Primary Color</label>
                  <input
                    type="color"
                    name="primaryColor"
                    value={editFormData.primaryColor}
                    onChange={handleEditChange}
                    className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Secondary Color</label>
                  <input
                    type="color"
                    name="secondaryColor"
                    value={editFormData.secondaryColor}
                    onChange={handleEditChange}
                    className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>Theme Mode</label>
                <select
                  name="mode"
                  value={editFormData.mode}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg shadow-md transition disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedOwner(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;