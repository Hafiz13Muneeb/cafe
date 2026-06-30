// src/components/superadmin/OwnerFormModal.jsx - Complete owner form modal for add/edit
import React from 'react';
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
  isEdit = false 
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={onSubmit} className="space-y-4 font-bold text-[#3E2723]">
        {/* Username */}
        <Input
          label="Username"
          name="username"
          value={formData.username || ''}
          onChange={handleChange}
          required
          placeholder="Enter username"
        />

        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          required={!isEdit}
          placeholder="Enter email address"
        />

        {/* Cafe Name */}
        <Input
          label="Cafe Name"
          name="cafeName"
          value={formData.cafeName || ''}
          onChange={handleChange}
          required
          placeholder="Enter cafe name"
        />

        {/* Temporary Password - only for adding new owners */}
        {!isEdit && (
          <Input
            label="Temporary Password"
            name="temporaryPassword"
            type="password"
            value={formData.temporaryPassword || ''}
            onChange={handleChange}
            required
            placeholder="Min 6 characters"
          />
        )}

        {/* WhatsApp Number - only for editing */}
        {isEdit && (
          <Input
            label="WhatsApp Number"
            name="whatsappNumber"
            value={formData.whatsappNumber || ''}
            onChange={handleChange}
            placeholder="e.g. 03001234567"
          />
        )}

        {/* Tables - only for editing */}
        {isEdit && (
          <Input
            label="Table Numbers / Names"
            name="tables"
            value={formData.tables || ''}
            onChange={handleChange}
            placeholder="1, 2, 3, 4, 5 (comma separated)"
          />
        )}

        {/* Theme Settings - only for editing */}
        {isEdit && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-[#3E2723]">Theme Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3E2723]/70 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor || '#d4a843'}
                    onChange={handleChange}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input
                    name="primaryColor"
                    value={formData.primaryColor || '#d4a843'}
                    onChange={handleChange}
                    className="flex-1"
                    placeholder="#d4a843"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#3E2723]/70 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor || '#b8860b'}
                    onChange={handleChange}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input
                    name="secondaryColor"
                    value={formData.secondaryColor || '#b8860b'}
                    onChange={handleChange}
                    className="flex-1"
                    placeholder="#b8860b"
                  />
                </div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div>
              <label className="block text-xs font-bold text-[#3E2723]/70 mb-1">
                Mode
              </label>
              <div className="flex gap-3">
                {['light', 'dark'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    name="mode"
                    onClick={() => setFormData(prev => ({ ...prev, mode: m }))}
                    className={`px-4 py-2 border-2 border-[#3E2723] font-bold transition ${
                      formData.mode === m 
                        ? 'bg-[#8A9A5B] text-white' 
                        : 'bg-white text-[#3E2723] hover:bg-[#EAE0C8]'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
          className="w-full border-2 border-[#3E2723] py-3 text-center justify-center"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Saving...
            </>
          ) : (
            isEdit ? 'Update Owner' : 'Create Owner'
          )}
        </Button>

        {/* Cancel Button */}
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onClose}
          className="w-full border-2 border-[#3E2723] py-3 text-center justify-center"
        >
          Cancel
        </Button>
      </form>
    </Modal>
  );
};

export default OwnerFormModal;