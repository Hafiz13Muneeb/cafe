import React from 'react';
import { Save, Upload } from 'lucide-react';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Button from '../common/Button';

const MenuItemForm = ({ isOpen, onClose, onSubmit, formData, setFormData, imagePreview, setImagePreview, loading, editingItem }) => {
  if (!isOpen) return null;
  
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="p-6 border-2 border-[#3E2723] bg-[#F5F5DC] mb-6" style={{ boxShadow: "6px 6px 0px 0px #8A9A5B" }}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" name="title" value={formData.title} onChange={handleFormChange} required />
          <Input label="Price (Rs.)" name="price" type="number" value={formData.price} onChange={handleFormChange} required />
          <TextArea label="Description" name="description" value={formData.description} onChange={handleFormChange} className="md:col-span-2" />
          <Input label="Category" name="category" value={formData.category} onChange={handleFormChange} required />
        </div>
        <div className="flex gap-4 items-center">
          <Button type="submit" variant="primary" disabled={loading}><Save size={16} className="inline mr-2" />{loading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};
export default MenuItemForm;