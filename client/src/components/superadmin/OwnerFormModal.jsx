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
  isEdit = false,
  error = '',
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form
        onSubmit={onSubmit}
        className="space-y-4 font-bold"
        style={{ color: 'var(--text-color)' }}
        noValidate
        aria-label="Owner form"
      >
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

        <Input
          label="Username"
          name="username"
          value={formData.username || ''}
          onChange={handleChange}
          required
          placeholder="Enter username"
          aria-label="Username"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          required={!isEdit}
          placeholder="Enter email address"
          aria-label="Email address"
        />

        <Input
          label="Cafe Name"
          name="cafeName"
          value={formData.cafeName || ''}
          onChange={handleChange}
          required
          placeholder="Enter cafe name"
          aria-label="Cafe name"
        />

        {!isEdit && (
          <Input
            label="Temporary Password"
            name="temporaryPassword"
            type="password"
            value={formData.temporaryPassword || ''}
            onChange={handleChange}
            required
            placeholder="Min 6 characters"
            aria-label="Temporary password"
          />
        )}

        {isEdit && (
          <Input
            label="WhatsApp Number"
            name="whatsappNumber"
            value={formData.whatsappNumber || ''}
            onChange={handleChange}
            placeholder="e.g. 03001234567"
            aria-label="WhatsApp number"
          />
        )}

        {isEdit && (
          <Input
            label="Table Numbers / Names"
            name="tables"
            value={formData.tables || ''}
            onChange={handleChange}
            placeholder="1, 2, 3, 4, 5 (comma separated)"
            aria-label="Table numbers"
          />
        )}

        {isEdit && (
          <div className="space-y-3">
            <p className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>Theme Settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-bold mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                  htmlFor="primaryColor"
                >
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    id="primaryColor"
                    value={formData.primaryColor || '#d4a843'}
                    onChange={handleChange}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                    aria-label="Primary color picker"
                  />
                  <Input
                    name="primaryColor"
                    value={formData.primaryColor || '#d4a843'}
                    onChange={handleChange}
                    className="flex-1"
                    placeholder="#d4a843"
                    aria-label="Primary color hex"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-bold mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                  htmlFor="secondaryColor"
                >
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    id="secondaryColor"
                    value={formData.secondaryColor || '#b8860b'}
                    onChange={handleChange}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                    aria-label="Secondary color picker"
                  />
                  <Input
                    name="secondaryColor"
                    value={formData.secondaryColor || '#b8860b'}
                    onChange={handleChange}
                    className="flex-1"
                    placeholder="#b8860b"
                    aria-label="Secondary color hex"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Mode
              </label>
              <div className="flex gap-3">
                {['light', 'dark'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    name="mode"
                    onClick={() => setFormData((prev) => ({ ...prev, mode: m }))}
                    className="px-4 py-2 border-2 border-[#3E2723] font-bold transition"
                    style={{
                      backgroundColor: formData.mode === m ? 'var(--primary-color)' : 'var(--card-bg)',
                      color: formData.mode === m ? '#ffffff' : 'var(--text-color)',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.mode !== m) {
                        e.target.style.backgroundColor = 'var(--secondary-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.mode !== m) {
                        e.target.style.backgroundColor = 'var(--card-bg)';
                      }
                    }}
                    aria-label={`Switch to ${m} mode`}
                    aria-pressed={formData.mode === m}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full border-2 border-[#3E2723] py-3 text-center justify-center"
          aria-label={isEdit ? 'Update owner' : 'Create owner'}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Saving...
            </>
          ) : isEdit ? (
            'Update Owner'
          ) : (
            'Create Owner'
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="w-full border-2 border-[#3E2723] py-3 text-center justify-center"
          aria-label="Cancel and close form"
        >
          Cancel
        </Button>
      </form>
    </Modal>
  );
};

export default OwnerFormModal;