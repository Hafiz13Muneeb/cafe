// src/pages/AdminDashboard.jsx - Cafe owner dashboard (multi-tenant)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  LogOut, 
  Settings, 
  Menu, 
  QrCode,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode.react';

const AdminDashboard = () => {
  const { user, logout, updateUserData } = useAuth();
  const { theme, updateTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Menu items state
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add/Edit form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsData, setSettingsData] = useState({
    cafeName: user?.cafeName || '',
    whatsappNumber: user?.whatsappNumber || '',
    logoUrl: user?.logoUrl || '',
    faviconUrl: user?.faviconUrl || '',
    tables: user?.tables || [],
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [newTableInput, setNewTableInput] = useState('');

  // Theme state (from user settings)
  const [primaryColor, setPrimaryColor] = useState(user?.theme?.primaryColor || '#d4a843');
  const [secondaryColor, setSecondaryColor] = useState(user?.theme?.secondaryColor || '#b8860b');
  const [themeMode, setThemeMode] = useState(user?.theme?.mode || 'light');

  // QR code state – uses dynamic slug
  const [qrValue, setQrValue] = useState('');
  const [cafeSlug, setCafeSlug] = useState(user?.slug || '');

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Generate QR URL using the current slug
  useEffect(() => {
    if (user?.slug) {
      const url = `${window.location.origin}/menu/${user.slug}`;
      setQrValue(url);
      setCafeSlug(user.slug);
    }
  }, [user]);

  // Fetch menu items on mount
  useEffect(() => {
    if (user) {
      fetchMenuItems();
      // Load settings from user object
      setSettingsData({
        cafeName: user.cafeName || '',
        whatsappNumber: user.whatsappNumber || '',
        logoUrl: user.logoUrl || '',
        faviconUrl: user.faviconUrl || '',
        tables: user.tables || [],
      });
      // Theme
      if (user.theme) {
        setPrimaryColor(user.theme.primaryColor || '#d4a843');
        setSecondaryColor(user.theme.secondaryColor || '#b8860b');
        setThemeMode(user.theme.mode || 'light');
        // Update theme context
        updateTheme(user.theme);
      }
    }
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/menu?all=true');
      if (response.data.success) {
        setMenuItems(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err.response?.data?.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // --- Form handlers ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', price: '', category: '', isAvailable: true });
    setImageFile(null);
    setImagePreview('');
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setImagePreview(item.imageUrl);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isAvailable', formData.isAvailable ? 'true' : 'false');
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (editingItem) {
        response = await api.put(`/menu/${editingItem._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/menu', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.data.success) {
        await fetchMenuItems();
        setIsFormOpen(false);
        setImageFile(null);
        setImagePreview('');
        setSuccess(editingItem ? 'Menu item updated!' : 'Menu item added!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const response = await api.delete(`/menu/${id}`);
      if (response.data.success) {
        await fetchMenuItems();
        setSuccess('Item deleted!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  // --- Settings handlers ---
  const handleAddTable = () => {
    const val = newTableInput.trim();
    if (val && !settingsData.tables.includes(val)) {
      setSettingsData(prev => ({
        ...prev,
        tables: [...prev.tables, val]
      }));
      setNewTableInput('');
    }
  };

  const handleRemoveTable = (table) => {
    setSettingsData(prev => ({
      ...prev,
      tables: prev.tables.filter(t => t !== table)
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('cafeName', settingsData.cafeName);
      formDataToSend.append('whatsappNumber', settingsData.whatsappNumber);
      formDataToSend.append('tables', settingsData.tables.join(','));
      formDataToSend.append('primaryColor', primaryColor);
      formDataToSend.append('secondaryColor', secondaryColor);
      formDataToSend.append('mode', themeMode);

      if (logoFile) formDataToSend.append('logo', logoFile);
      if (faviconFile) formDataToSend.append('favicon', faviconFile);

      const response = await api.put('/settings', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const data = response.data.data;
        // Update local user data
        updateUserData({
          cafeName: data.cafeName,
          whatsappNumber: data.whatsappNumber,
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          tables: data.tables || [],
          theme: data.theme,
        });
        setSettingsData({
          cafeName: data.cafeName,
          whatsappNumber: data.whatsappNumber,
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          tables: data.tables || [],
        });
        setPrimaryColor(data.theme?.primaryColor || '#d4a843');
        setSecondaryColor(data.theme?.secondaryColor || '#b8860b');
        setThemeMode(data.theme?.mode || 'light');
        updateTheme(data.theme);
        setLogoFile(null);
        setFaviconFile(null);
        setIsSettingsOpen(false);
        setSuccess('Settings updated!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Download QR
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `cafe-${cafeSlug}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
              {user.cafeName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Settings Panel */}
        {isSettingsOpen && (
          <div className="mb-6 bg-white rounded-xl shadow-soft p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
            <form onSubmit={handleSettingsSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cafe Name</label>
                <input
                  type="text"
                  value={settingsData.cafeName}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, cafeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Public slug: /menu/{cafeSlug}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input
                  type="tel"
                  value={settingsData.whatsappNumber}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="923001234567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tables (comma separated)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settingsData.tables.map(table => (
                    <span key={table} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {table}
                      <button type="button" onClick={() => handleRemoveTable(table)} className="hover:text-red-600">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTableInput}
                    onChange={(e) => setNewTableInput(e.target.value)}
                    placeholder="e.g., 6, VIP, Patio"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="button" onClick={handleAddTable} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="flex items-center gap-4">
                  {settingsData.logoUrl && <img src={settingsData.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />}
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-sm">{logoFile ? logoFile.name : 'Upload Logo'}</span>
                    <input type="file" accept="image/*" onChange={(e) => { setLogoFile(e.target.files[0]); }} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Favicon</label>
                <div className="flex items-center gap-4">
                  {settingsData.faviconUrl && <img src={settingsData.faviconUrl} alt="Favicon" className="w-10 h-10 object-cover rounded border border-gray-200" />}
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-sm">{faviconFile ? faviconFile.name : 'Upload Favicon'}</span>
                    <input type="file" accept="image/*" onChange={(e) => { setFaviconFile(e.target.files[0]); }} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Theme section */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Theme Customization</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Mode</span>
                  <button
                    type="button"
                    onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    {themeMode === 'light' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-indigo-500" />}
                    <span>{themeMode === 'light' ? 'Light' : 'Dark'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer" />
                  </div>
                </div>
                {/* Live preview */}
                <div className="mt-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: primaryColor }}>Primary</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: secondaryColor }}>Secondary</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={settingsLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                  {settingsLoading ? 'Saving...' : 'Save Settings'}
                </button>
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QR Code Section */}
        <div className="mb-6 bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <QrCode size={24} className="text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Menu QR Code</h3>
                <p className="text-sm text-gray-500">Scan to view your menu: /menu/{cafeSlug}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <QRCode id="qr-code-canvas" value={qrValue} size={80} level="H" includeMargin />
              </div>
              <button onClick={downloadQR} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm">
                Download QR
              </button>
            </div>
          </div>
        </div>

        {/* Menu Management */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Menu size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Menu Items ({menuItems.length})</h2>
            </div>
            <button onClick={handleAddNew} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm">
              <Plus size={16} /> Add New
            </button>
          </div>

          {/* Form */}
          {isFormOpen && (
            <div className="p-4 border-b border-gray-100 bg-gray-50 animate-fade-in">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (Rs.) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required min="0" step="0.01" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleFormChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <input type="text" name="category" value={formData.category} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required placeholder="e.g., Burgers" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <Upload size={16} className="text-gray-500" />
                        <span className="text-sm">Choose Image</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      {imagePreview && <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleFormChange} className="w-4 h-4 text-green-500" />
                      Available
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={formLoading} className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                    <Save size={16} /> {formLoading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
                  </button>
                  <button type="button" onClick={() => { setIsFormOpen(false); setImageFile(null); setImagePreview(''); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-green-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500">Loading items...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ImageIcon size={40} className="mx-auto text-gray-300 mb-2" />
                <p>No menu items yet. Click "Add New" to get started.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {menuItems.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3"><img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover" /></td>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">Rs. {item.price}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;