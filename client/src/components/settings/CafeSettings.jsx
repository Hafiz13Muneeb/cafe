import React, { useRef, useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Upload, Save, Plus, X } from 'lucide-react';

const CafeSettings = ({
  cafeName, setCafeName, whatsappNumber, setWhatsappNumber,
  tables, setTables, slug, setSlug, email, setEmail,
  logoPreview, setLogoPreview, faviconPreview, setFaviconPreview,
  loading, onSubmit, onImageUpload,
}) => {
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const [newTable, setNewTable] = useState('');

  const handleAddTable = () => {
    // Naya table add hotay waqt bhi kachra saaf kar dein
    const cleanVal = newTable.replace(/[\[\]"'\\]/g, '').trim();
    if (cleanVal && !tables.includes(cleanVal)) {
      setTables([...tables, cleanVal]);
      setNewTable('');
    }
  };

  const handleDeleteTable = (indexToDelete) => {
    const updatedTables = tables.filter((_, index) => index !== indexToDelete);
    setTables(updatedTables);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTable();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Cafe Name" value={cafeName} onChange={(e) => setCafeName(e.target.value)} required />
      <Input label="Slug (URL identifier)" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} required />
      <p className="text-xs text-[var(--text-color)]/60 -mt-2">
        This will be used in the public menu URL: /menu/{slug || 'your-slug'}
      </p>
      <Input label="WhatsApp Number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} required />
      <Input label="Support Email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <div className="space-y-2">
        <label className="block text-sm font-bold text-[var(--text-color)]">Table Numbers / Names</label>
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border-2 border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)]"
            placeholder="Add new table (e.g. Table 6)"
            value={newTable}
            onChange={(e) => setNewTable(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" variant="secondary" onClick={handleAddTable}>
            <Plus size={20} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {tables.map((t, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-[#222] text-white px-3 py-1.5 text-sm border-2 border-[#222]"
            >
              <span>{t}</span>
              <button
                type="button"
                onClick={() => handleDeleteTable(index)}
                className="hover:text-red-400 focus:outline-none"
                title="Delete Table"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-bold text-[var(--text-color)] mb-1">Logo</label>
          <div className="flex items-center gap-3">
            {logoPreview && <img src={logoPreview} alt="Logo" className="w-12 h-12 border-2 border-[var(--border-color)] object-cover" />}
            <input type="file" accept="image/*" ref={logoInputRef} onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0], 'logo', setLogoPreview)} className="hidden" />
            <Button type="button" variant="secondary" onClick={() => logoInputRef.current?.click()}>
              <Upload size={16} className="inline mr-1" /> Upload
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--text-color)] mb-1">Favicon</label>
          <div className="flex items-center gap-3">
            {faviconPreview && <img src={faviconPreview} alt="Favicon" className="w-10 h-10 border-2 border-[var(--border-color)] object-cover" />}
            <input type="file" accept="image/*" ref={faviconInputRef} onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0], 'favicon', setFaviconPreview)} className="hidden" />
            <Button type="button" variant="secondary" onClick={() => faviconInputRef.current?.click()}>
              <Upload size={16} className="inline mr-1" /> Upload
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto mt-6">
        <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Save Cafe Settings'}
      </Button>
    </form>
  );
};

export default CafeSettings;