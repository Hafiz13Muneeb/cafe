// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Plus,
  AlertCircle,
  CheckCircle,
  Menu,
} from 'lucide-react';
import Button from '../components/common/Button';
import QRCodeDisplay from '../components/owner/QRCodeDisplay';
import MenuItemForm from '../components/owner/MenuItemForm';
import MenuItemTable from '../components/owner/MenuItemTable';
import DashboardLayout from '../components/layout/DashboardLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '', isAvailable: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [qrValue, setQrValue] = useState('');
  const [cafeSlug, setCafeSlug] = useState(user?.slug || '');

  // --- Effects ---
  useEffect(() => {
    if (success) setTimeout(() => setSuccess(''), 3000);
  }, [success]);

  useEffect(() => {
    if (user?.slug) {
      setQrValue(`${window.location.origin}/menu/${user.slug}`);
      setCafeSlug(user.slug);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchMenuItems();
  }, [user]);

  // --- API calls ---
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/menu?all=true');
      if (response.data.success) setMenuItems(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  // --- Menu CRUD ---
  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', price: '', category: '', isAvailable: true });
    setImageFile(null);
    setImagePreview('');
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setImagePreview(item.imageUrl);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async () => {
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isAvailable', formData.isAvailable ? 'true' : 'false');
      if (imageFile) formDataToSend.append('image', imageFile);

      let response;
      if (editingItem) {
        response = await api.put(`/menu/${editingItem._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/menu', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.data.success) {
        await fetchMenuItems();
        setIsFormOpen(false);
        setImageFile(null);
        setImagePreview('');
        setSuccess(editingItem ? 'Menu item updated!' : 'Menu item added!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const response = await api.delete(`/menu/${id}`);
      if (response.data.success) {
        await fetchMenuItems();
        setSuccess('Item deleted!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout title="Menu Manager" subtitle={user.cafeName}>
      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm flex items-start gap-2">
          <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* QR Code */}
      <QRCodeDisplay
        cafeName={user.cafeName}
        slug={cafeSlug}
        qrValue={qrValue}
      />

      {/* Menu Management */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Menu size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Menu Items ({menuItems.length})</h2>
          </div>
          <Button variant="primary" onClick={handleAddNew} className="flex items-center gap-1">
            <Plus size={16} /> Add New
          </Button>
        </div>

        <MenuItemForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setImageFile(null); setImagePreview(''); }}
          onSubmit={handleFormSubmit}
          formData={formData}
          setFormData={setFormData}
          imageFile={imageFile}
          setImageFile={setImageFile}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          editingItem={editingItem}
          loading={formLoading}
        />

        <MenuItemTable
          items={menuItems}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;