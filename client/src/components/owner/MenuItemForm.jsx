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
    <div className="p-4 sm:p-6 border-2 border-[#3E2723] bg-[#F5F5DC] mb-6" style={{ boxShadow: "4px 4px 0px 0px #8A9A5B" }}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Input label="Title" name="title" value={formData.title} onChange={handleFormChange} required />
          <Input label="Price (Rs.)" name="price" type="number" value={formData.price} onChange={handleFormChange} required />
          <TextArea label="Description" name="description" value={formData.description} onChange={handleFormChange} className="md:col-span-2" />
          <Input label="Category" name="category" value={formData.category} onChange={handleFormChange} required />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-1 sm:gap-2">
            <Save size={16} /> {loading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};
export default MenuItemForm;