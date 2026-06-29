// src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import OwnerTable from '../components/superadmin/OwnerTable';
import OwnerFormModal from '../components/superadmin/OwnerFormModal';
import DashboardLayout from '../components/layout/DashboardLayout';

const SuperAdminDashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSuperAdmin) navigate('/admin/dashboard');
  }, [isSuperAdmin, navigate]);

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    cafeName: '',
    temporaryPassword: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    cafeName: '',
    whatsappNumber: '',
    tables: '',
    primaryColor: '#d4a843',
    secondaryColor: '#b8860b',
    mode: 'light',
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/owners');
      if (response.data.success) {
        const ownersData = response.data.data || [];
        const ownersWithNotes = await Promise.all(
          ownersData.map(async (owner) => {
            try {
              const notesRes = await api.get(`/analytics/notes/${owner._id}`);
              const notes = notesRes.data.data || [];
              const activeReminders = notes.filter(n => 
                n.isReminderActive && n.reminderDate && new Date(n.reminderDate) <= new Date()
              );
              return { ...owner, activeReminders: activeReminders.length };
            } catch {
              return { ...owner, activeReminders: 0 };
            }
          })
        );
        ownersWithNotes.sort((a, b) => b.activeReminders - a.activeReminders);
        setOwners(ownersWithNotes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        username: addFormData.username.trim(),
        email: addFormData.email.trim().toLowerCase(),
        cafeName: addFormData.cafeName.trim(),
        temporaryPassword: addFormData.temporaryPassword,
      };
      const response = await api.post('/auth/create-owner', payload);
      if (response.data.success) {
        const newOwner = response.data.data.user;
        setOwners(prev => [newOwner, ...prev]);
        setIsAddModalOpen(false);
        setAddFormData({ username: '', email: '', cafeName: '', temporaryPassword: '' });
        setSuccess(`✅ Owner created successfully!\nUsername: ${newOwner.username}\nCafe: ${newOwner.cafeName}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create owner');
    } finally {
      setAddLoading(false);
    }
  };

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

  if (!isSuperAdmin) return null;

  return (
    <DashboardLayout title="Super Admin" subtitle="Control Panel">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-lg text-sm flex items-start gap-2 whitespace-pre-line" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
          <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Cafe Owners</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage all registered cafe owners</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={fetchOwners} className="p-2">
            <RefreshCw size={18} />
          </Button>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} />
            Add Owner
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <OwnerTable
          owners={owners}
          loading={loading}
          onToggleBlock={handleToggleBlock}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>

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
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;