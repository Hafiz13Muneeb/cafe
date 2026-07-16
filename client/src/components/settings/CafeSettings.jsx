// src/components/settings/CafeSettings.jsx
import React, { useRef } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Upload, Save } from 'lucide-react';

const CafeSettings = ({
  cafeName,
  setCafeName,
  whatsappNumber,
  setWhatsappNumber,
  tables,
  setTables,
  slug,
  setSlug,
  email,
  setEmail,
  logoPreview,
  setLogoPreview,
  faviconPreview,
  setFaviconPreview,
  loading,
  onSubmit,
  onImageUpload,
}) => {
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const handleTablesBlur = () => {
    const trimmed = tables
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .join(', ');
    setTables(trimmed);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Cafe Name"
        value={cafeName}
        onChange={(e) => setCafeName(e.target.value)}
        required
        aria-label="Cafe name"
      />
      <Input
        label="Slug (URL identifier)"
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase())}
        required
        placeholder="e.g. my-cafe"
        aria-label="Slug"
      />
      <p className="text-xs text-[#3E2723]/60 -mt-2">
        This will be used in the public menu URL: /menu/{slug || 'your-slug'}
      </p>
      <Input
        label="WhatsApp Number"
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value)}
        placeholder="e.g. 03001234567"
        required
        aria-label="WhatsApp number"
      />
      <Input
        label="Support Email (for customer questions)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="support@mycafe.com"
        aria-label="Support email"
      />
      <Input
        label="Table Numbers / Names"
        value={tables}
        onChange={(e) => setTables(e.target.value)}
        onBlur={handleTablesBlur}
        placeholder="1, 2, 3, 4, 5 (comma separated)"
        required
        aria-label="Table numbers or names"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="logoUpload">
            Logo
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Cafe logo preview"
                className="w-12 h-12 border-2 border-[#3E2723] object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              onChange={(e) => {
                if (e.target.files[0]) {
                  onImageUpload(e.target.files[0], 'logo', setLogoPreview);
                }
              }}
              className="hidden"
              id="logoUpload"
              aria-label="Upload logo"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => logoInputRef.current?.click()}
              className="text-sm sm:text-base"
            >
              <Upload size={16} className="inline mr-1" /> Upload Logo
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="faviconUpload">
            Favicon
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {faviconPreview && (
              <img
                src={faviconPreview}
                alt="Favicon preview"
                className="w-10 h-10 border-2 border-[#3E2723] object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              ref={faviconInputRef}
              onChange={(e) => {
                if (e.target.files[0]) {
                  onImageUpload(e.target.files[0], 'favicon', setFaviconPreview);
                }
              }}
              className="hidden"
              id="faviconUpload"
              aria-label="Upload favicon"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => faviconInputRef.current?.click()}
              className="text-sm sm:text-base"
            >
              <Upload size={16} className="inline mr-1" /> Upload Favicon
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
        <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Save Cafe Settings'}
      </Button>
    </form>
  );
};

export default CafeSettings;