// src/components/settings/AppearanceSettings.jsx
import React from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Save } from 'lucide-react';

const AppearanceSettings = ({
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  mode,
  setMode,
  loading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="primaryColor">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
              aria-label="Primary color picker"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1"
              aria-label="Primary color hex"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="secondaryColor">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="secondaryColor"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
              aria-label="Secondary color picker"
            />
            <Input
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="flex-1"
              aria-label="Secondary color hex"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-[#3E2723] mb-1">Mode</label>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {['light', 'dark'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 sm:px-4 py-2 border-2 border-[#3E2723] font-bold transition text-sm sm:text-base ${
                mode === m ? 'bg-[#8A9A5B] text-white' : 'bg-white text-[#3E2723]'
              }`}
              aria-label={`Switch to ${m} mode`}
              aria-pressed={mode === m}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
        <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Save Theme'}
      </Button>
    </form>
  );
};

export default AppearanceSettings;