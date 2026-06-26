// src/components/superadmin/OwnerFormModal.jsx - Add/Edit owner modal
import React from 'react';
import { X } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const OwnerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
  loading,
  isEdit = false,
  submitLabel = 'Create Owner',
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        {!isEdit && (
          <Input
            label="Username"
            name="username"
            value={formData.username || ''}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={30}
          />
        )}
        {!isEdit && (
          <Input
            label="Email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            type="email"
            required
          />
        )}
        <Input
          label="Cafe Name"
          name="cafeName"
          value={formData.cafeName || ''}
          onChange={handleChange}
          required
        />
        {!isEdit && (
          <div>
            <Input
              label="Temporary Password"
              name="temporaryPassword"
              value={formData.temporaryPassword || ''}
              onChange={handleChange}
              type="text"
              placeholder="Leave blank to auto-generate"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Min 6 characters. If left blank, a secure password will be generated.</p>
          </div>
        )}
        {isEdit && (
          <>
            <Input
              label="WhatsApp Number"
              name="whatsappNumber"
              value={formData.whatsappNumber || ''}
              onChange={handleChange}
              type="tel"
              placeholder="e.g., 923001234567"
            />
            <Input
              label="Tables (comma-separated)"
              name="tables"
              value={formData.tables || ''}
              onChange={handleChange}
              placeholder="e.g., 1, 2, 3, VIP, Patio"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor || '#d4a843'}
                  onChange={handleChange}
                  className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor || '#b8860b'}
                  onChange={handleChange}
                  className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Theme Mode</label>
              <select
                name="mode"
                value={formData.mode || 'light'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--primary-color)' }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : submitLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OwnerFormModal;