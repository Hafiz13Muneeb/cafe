// src/components/owner/MenuItemForm.jsx - Add/Edit menu item form
import React from 'react';
import { Save, Upload, X } from 'lucide-react';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Button from '../common/Button';

const MenuItemForm = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  editingItem,
  loading,
}) => {
  if (!isOpen) return null;

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="p-4 border-b border-gray-100 bg-gray-50 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            required
          />
          <Input
            label="Price (Rs.)"
            name="price"
            value={formData.price}
            onChange={handleFormChange}
            type="number"
            required
            min="0"
            step="0.01"
          />
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            className="md:col-span-2"
          />
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            required
            placeholder="e.g., Burgers"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <Upload size={16} className="text-gray-500" />
                <span className="text-sm">Choose Image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleFormChange}
                className="w-4 h-4 text-primary rounded"
                style={{ accentColor: 'var(--primary-color)' }}
              />
              Available
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-1">
            <Save size={16} /> {loading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;