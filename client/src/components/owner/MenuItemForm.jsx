import React from 'react';
import { Save, Upload } from 'lucide-react';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Button from '../common/Button';

const MenuItemForm = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
  loading,
  editingItem,
  error = '',
  currency = 'Rs',
}) => {
  if (!isOpen) return null;

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div
      className="p-4 sm:p-6 border-2 border-[#3E2723] mb-6"
      style={{
        backgroundColor: 'var(--bg-color)',
        boxShadow: '4px 4px 0px 0px var(--primary-color)',
      }}
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
        {error && (
          <div
            className="p-3 border-2 border-[#3E2723] bg-red-300 font-bold text-sm sm:text-base"
            style={{ color: 'var(--text-color)' }}
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            required
            aria-label="Item title"
          />
          <Input
            label={`Price (${currency})`}
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleFormChange}
            required
            aria-label="Item price"
          />
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            className="md:col-span-2"
            aria-label="Item description"
          />
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            required
            aria-label="Item category"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex items-center gap-1 sm:gap-2"
            aria-label={editingItem ? 'Update item' : 'Add item'}
          >
            <Save size={16} /> {loading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            aria-label="Cancel editing"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;