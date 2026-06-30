// src/pages/AdminDashboard.jsx - Complete menu management with CRUD operations
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Menu, Upload, X, Save } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import QRCodeDisplay from '../components/owner/QRCodeDisplay';
import MenuItemTable from '../components/owner/MenuItemTable';
import DashboardLayout from '../components/layout/DashboardLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/menu?all=true');
      if (response.data.success) {
        setMenuItems(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMenuItems();
  }, [user]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', category: '', isAvailable: true });
    setImageFile(null);
    setImagePreview('');
    setEditingItem(null);
    setIsFormOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
    setEditingItem(null);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    });
    setImagePreview(item.imageUrl || '');
    setImageFile(null);
    setIsFormOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Please enter a valid price');
      return;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }
    if (!editingItem && !imageFile) {
      setError('Please select an image');
      return;
    }

    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim() || '');
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('isAvailable', formData.isAvailable);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

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
        setSuccess(editingItem ? 'Menu item updated successfully!' : 'Menu item added successfully!');
        fetchMenuItems();
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu item');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await api.delete(`/menu/${itemId}`);
      setSuccess('Menu item deleted successfully');
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Menu Manager" subtitle={user?.cafeName}>
      {error && (
        <div className="mb-4 p-3 border-2 border-[#3E2723] bg-red-300 text-[#3E2723] font-bold text-sm sm:text-base">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 border-2 border-[#3E2723] bg-[#8A9A5B] text-white font-bold text-sm sm:text-base">
          {success}
        </div>
      )}

      <QRCodeDisplay 
        cafeName={user?.cafeName} 
        slug={user?.slug} 
        qrValue={`${window.location.origin}/menu/${user?.slug}`} 
      />

      <div className="bg-white border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] overflow-hidden mt-6">
        <div className="p-3 sm:p-4 border-b-2 border-[#3E2723] flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-[#3E2723] flex items-center gap-2">
            <Menu size={20} /> Menu Items ({menuItems.length})
          </h2>
          <Button variant="primary" onClick={openAddForm} className="text-sm sm:text-base">
            <Plus size={16} className="inline mr-1" /> Add New
          </Button>
        </div>

        {/* Wrapper with horizontal scroll for table on small screens */}
        <div className="overflow-x-auto">
          <MenuItemTable 
            items={menuItems} 
            loading={loading} 
            onEdit={openEditForm} 
            onDelete={handleDelete} 
          />
        </div>
      </div>

      {isFormOpen && (
        <div className="mt-6 bg-white border-2 border-[#3E2723] p-4 sm:p-6 shadow-[6px_6px_0px_0px_#3E2723]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            <button onClick={resetForm} className="p-1 hover:bg-[#EAE0C8] border-2 border-[#3E2723]">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                placeholder="Item name"
              />
              <Input
                label="Price (Rs.)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleFormChange}
                required
                placeholder="0.00"
              />
              <TextArea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={2}
                placeholder="Optional description"
                className="md:col-span-2"
              />
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
                placeholder="e.g. Burgers, Drinks, Desserts"
                className="md:col-span-2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1">
                Image {!editingItem && <span className="text-red-500">*</span>}
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
                {imagePreview && (
                  <div className="relative w-20 h-20 border-2 border-[#3E2723] overflow-hidden flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm"
                >
                  <Upload size={16} className="inline mr-1" />
                  {editingItem && !imageFile ? 'Change Image' : 'Upload Image'}
                </Button>
                {editingItem && !imageFile && imagePreview && (
                  <span className="text-xs text-[#3E2723]/60">(Keep current image)</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-[#3E2723]">Available:</label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.isAvailable ? 'bg-[#8A9A5B]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.isAvailable ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-bold text-[#3E2723]">
                {formData.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={formLoading} className="flex-1 justify-center text-sm sm:text-base">
                {formLoading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="inline mr-1" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </>
                )}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} className="flex-1 justify-center text-sm sm:text-base">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;