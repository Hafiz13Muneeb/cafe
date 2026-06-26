// src/pages/SuperAdminDashboard.jsx - Superadmin panel (refactored)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, LogOut, RefreshCw, Settings, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import OwnerTable from '../components/superadmin/OwnerTable';
import OwnerFormModal from '../components/superadmin/OwnerFormModal';

const SuperAdminDashboard = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

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

  // Add form state
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    cafeName: '',
    temporaryPassword: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    cafeName: '',
    whatsappNumber: '',
    tables: '',
    primaryColor: '#d4a843',
    secondaryColor: '#b8860b',
    mode: 'light',
  });
  const [editLoading, setEditLoading] = useState(false);

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
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/auth/create-owner', addFormData);
      if (response.data.success) {
        const newOwner = response.data.data.user;
        const tempPassword = response.data.data.temporaryPassword;
        setOwners(prev => [newOwner, ...prev]);
        setIsAddModalOpen(false);
        setAddFormData({ username: '', email: '', cafeName: '', temporaryPassword: '' });
        setSuccess(`Owner created! Temporary password: ${tempPassword} (copy it now)`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create owner');
    } finally {
      setAddLoading(false);
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
    setEditLoading(true);
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
      setEditLoading(false);
    }
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
            <Button variant="secondary" onClick={fetchOwners} className="p-2">
              <RefreshCw size={20} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/settings')} className="p-2">
              <Settings size={20} />
            </Button>
            <Button variant="secondary" onClick={handleLogout} className="p-2">
              <LogOut size={20} />
            </Button>
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
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} />
            Add Owner
          </Button>
        </div>

        {/* Owners Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <OwnerTable
            owners={owners}
            loading={loading}
            onToggleBlock={handleToggleBlock}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* --- Add Owner Modal --- */}
      <OwnerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOwner}
        title="Add New Cafe Owner"
        formData={addFormData}
        setFormData={setAddFormData}
        loading={addLoading}
        isEdit={false}
        submitLabel="Create Owner"
      />

      {/* --- Edit Owner Modal --- */}
      <OwnerFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedOwner(null); }}
        onSubmit={handleEditSubmit}
        title={`Edit Owner: ${selectedOwner?.cafeName || ''}`}
        formData={editFormData}
        setFormData={setEditFormData}
        loading={editLoading}
        isEdit={true}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default SuperAdminDashboard;