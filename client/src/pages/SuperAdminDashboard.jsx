// src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import OwnerTable from '../components/superadmin/OwnerTable';
import OwnerFormModal from '../components/superadmin/OwnerFormModal';
import DashboardLayout from '../components/layout/DashboardLayout';

/**
 * Helper: Fetch notes for a single owner with error handling
 */
const fetchOwnerNotes = async (ownerId) => {
  try {
    const response = await api.get(`/analytics/notes/${ownerId}`);
    const notes = response.data?.data || [];
    const activeReminders = notes.filter(
      (n) =>
        n.isReminderActive &&
        n.reminderDate &&
        new Date(n.reminderDate) <= new Date()
    );
    return { ownerId, activeReminders: activeReminders.length, error: null };
  } catch (err) {
    console.error(`Failed to fetch notes for owner ${ownerId}:`, err.message);
    return { ownerId, activeReminders: 0, error: err };
  }
};

/**
 * Process an array of promises with a concurrency limit
 */
const promiseAllWithLimit = async (tasks, limit) => {
  const results = [];
  const executing = [];
  for (const task of tasks) {
    const p = task().then((result) => {
      executing.splice(executing.indexOf(p), 1);
      return result;
    });
    results.push(p);
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
};

const SuperAdminDashboard = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if not superadmin
  useEffect(() => {
    if (!isSuperAdmin) navigate('/admin/dashboard');
  }, [isSuperAdmin, navigate]);

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cache for activeReminders to avoid refetching on refresh
  const reminderCache = useRef({});

  // Add/Edit modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    cafeName: '',
    temporaryPassword: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [editFormData, setEditFormData] = useState({
    cafeName: '',
    whatsappNumber: '',
    tables: '',
    primaryColor: '#d4a843',
    secondaryColor: '#b8860b',
    mode: 'light',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Fetch owners with optional force refresh
  const fetchOwners = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/users/owners');
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to load owners');
        }

        const ownersData = response.data.data || [];

        // If forceRefresh is false, try to use cached reminder counts
        let ownersWithReminders;
        if (!forceRefresh && reminderCache.current) {
          ownersWithReminders = ownersData.map((owner) => ({
            ...owner,
            activeReminders: reminderCache.current[owner._id] ?? 0,
          }));
        } else {
          // Fetch notes for each owner with concurrency limit (5 at a time)
          const noteTasks = ownersData.map(
            (owner) => () => fetchOwnerNotes(owner._id)
          );
          const noteResults = await promiseAllWithLimit(noteTasks, 5);

          // Build map of ownerId -> activeReminders
          const reminderMap = {};
          noteResults.forEach((result) => {
            if (result.ownerId) {
              reminderMap[result.ownerId] = result.activeReminders;
            }
          });

          // Update cache
          reminderCache.current = { ...reminderCache.current, ...reminderMap };

          ownersWithReminders = ownersData.map((owner) => ({
            ...owner,
            activeReminders: reminderMap[owner._id] ?? 0,
          }));
        }

        // Sort by activeReminders descending (most urgent first)
        ownersWithReminders.sort((a, b) => b.activeReminders - a.activeReminders);
        setOwners(ownersWithReminders);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load owners');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOwners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // ----- Handlers -----
  const handleAddOwner = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/auth/create-owner', addFormData);
      if (response.data.success) {
        const newOwner = { ...response.data.data.user, activeReminders: 0 };
        setOwners((prev) => [newOwner, ...prev]);
        setIsAddModalOpen(false);
        setSuccess('Owner created successfully!');
        setAddFormData({
          username: '',
          email: '',
          cafeName: '',
          temporaryPassword: '',
        });
        // Invalidate cache for this owner (will be fetched on next refresh)
        if (newOwner._id) {
          delete reminderCache.current[newOwner._id];
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create owner');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleBlock = async (ownerId, currentStatus) => {
    try {
      setError('');
      setSuccess('');
      const response = await api.put(`/users/owners/${ownerId}/toggle-block`);
      if (response.data.success) {
        setOwners((prev) =>
          prev.map((o) =>
            o._id === ownerId ? { ...o, isBlocked: !o.isBlocked } : o
          )
        );
        setSuccess(`Owner ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
      }
    } catch (err) {
      setError('Failed to toggle block status');
    }
  };

  const handleDelete = async (ownerId) => {
    if (!window.confirm('Are you sure you want to delete this owner? This action cannot be undone.'))
      return;
    try {
      setError('');
      setSuccess('');
      await api.delete(`/users/owners/${ownerId}`);
      setOwners((prev) => prev.filter((o) => o._id !== ownerId));
      delete reminderCache.current[ownerId];
      setSuccess('Owner deleted successfully');
    } catch (err) {
      setError('Failed to delete owner');
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
        cafeName: editFormData.cafeName,
        whatsappNumber: editFormData.whatsappNumber,
        tables: editFormData.tables
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        theme: {
          primaryColor: editFormData.primaryColor,
          secondaryColor: editFormData.secondaryColor,
          mode: editFormData.mode,
        },
      };
      const response = await api.put(`/users/owners/${selectedOwner._id}`, payload);
      if (response.data.success) {
        const updatedOwner = response.data.data;
        const cachedReminders = reminderCache.current[updatedOwner._id] ?? 0;
        setOwners((prev) =>
          prev.map((o) =>
            o._id === selectedOwner._id
              ? { ...updatedOwner, activeReminders: cachedReminders }
              : o
          )
        );
        setIsEditModalOpen(false);
        setSuccess('Owner updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update owner');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <DashboardLayout title="Super Admin" subtitle="Control Panel">
      {error && (
        <div className="mb-4 p-3 border-2 border-[#3E2723] bg-red-300 text-[#3E2723] font-bold flex items-center gap-2 text-sm sm:text-base">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 border-2 border-[#3E2723] bg-[#8A9A5B] text-white font-bold flex items-center gap-2 text-sm sm:text-base">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3 sm:gap-4 mb-6 bg-[#EAE0C8] p-3 sm:p-4 border-2 border-[#3E2723]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#3E2723]">Cafe Owners</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => fetchOwners(true)}
            disabled={loading}
            className="text-sm sm:text-base"
          >
            <RefreshCw size={16} className={`inline mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="text-sm sm:text-base"
          >
            <Plus size={16} className="inline mr-1" /> Add Owner
          </Button>
        </div>
      </div>

      <div className="border-2 border-[#3E2723] bg-white p-1 sm:p-2 overflow-x-auto">
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
        onClose={() => {
          setIsAddModalOpen(false);
          setAddFormData({ username: '', email: '', cafeName: '', temporaryPassword: '' });
        }}
        onSubmit={handleAddOwner}
        title="Add New Cafe Owner"
        formData={addFormData}
        setFormData={setAddFormData}
        loading={addLoading}
        isEdit={false}
        error={error}
      />

      <OwnerFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOwner(null);
        }}
        onSubmit={handleEditSubmit}
        title="Edit Owner Details"
        formData={editFormData}
        setFormData={setEditFormData}
        loading={editLoading}
        isEdit={true}
        error={error}
      />
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;