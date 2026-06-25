// src/pages/AdminDashboard.jsx - Admin dashboard with menu management, settings, QR code, and theme customization
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Sun,
  Moon,
  CheckCircle
} from 'lucide-react';
import QRCode from 'qrcode.react';

// Preset color palettes
const presetPalettes = [
  { name: 'Royal Gold', primary: '#d4a843', secondary: '#b8860b' },
  { name: 'Emerald', primary: '#10b981', secondary: '#059669' },
  { name: 'Rich Blue', primary: '#3b82f6', secondary: '#1d4ed8' },
  { name: 'Crimson', primary: '#ef4444', secondary: '#b91c1c' },
  { name: 'Amethyst', primary: '#8b5cf6', secondary: '#6d28d9' },
  { name: 'Warm Orange', primary: '#f59e0b', secondary: '#d97706' },
];

const AdminDashboard = () => {
  const { admin, logout, updateAdminData } = useAuth();
  const navigate = useNavigate();

  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // success message

  // State for add/edit form
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

  // State for settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsData, setSettingsData] = useState({
    whatsappNumber: admin?.whatsappNumber || '',
    cafeName: admin?.cafeName || '',
    logoUrl: '',
    faviconUrl: '',
    tables: [],
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  // For file uploads in settings
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [newTableInput, setNewTableInput] = useState('');

  // State for Admin credentials change
  const [newUsername, setNewUsername] = useState(admin?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  // Sync newUsername when admin data is loaded/updated
  useEffect(() => {
    if (admin) {
      setNewUsername(admin.username || '');
    }
  }, [admin]);

  // Theme state
  const [primaryColor, setPrimaryColor] = useState('#d4a843');
  const [secondaryColor, setSecondaryColor] = useState('#b8860b');
  const [themeMode, setThemeMode] = useState('light');

  // State for QR code
  const [qrValue, setQrValue] = useState(window.location.origin + '/menu');

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Check if admin is authenticated
  useEffect(() => {
    if (!admin) {
      navigate('/admin');
    }
  }, [admin, navigate]);

  // Fetch menu items (including unavailable)
  useEffect(() => {
    fetchMenuItems();
    fetchSettings();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu?all=true');
      if (response.data.success) {
        setMenuItems(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.success) {
        const data = response.data.data;
        setSettingsData({
          whatsappNumber: data.whatsappNumber || '',
          cafeName: data.cafeName || '',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          tables: data.tables || [],
        });
        // Theme
        if (data.theme) {
          setPrimaryColor(data.theme.primaryColor || '#d4a843');
          setSecondaryColor(data.theme.secondaryColor || '#b8860b');
          setThemeMode(data.theme.mode || 'light');
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // Handle form input changes (menu item)
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle image selection for menu item
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

  // Handle file selection for logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  // Handle file selection for favicon
  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
    }
  };

  // Open form for adding new item
  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      isAvailable: true,
    });
    setImageFile(null);
    setImagePreview('');
    setIsFormOpen(true);
  };

  // Open form for editing existing item
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

  // Handle form submit (create or update)
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
      // Send boolean as string to match backend parsing
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
        setSuccess(editingItem ? 'Menu item updated successfully!' : 'Menu item added successfully!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save item';
      setError(message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await api.delete(`/menu/${id}`);
      if (response.data.success) {
        await fetchMenuItems();
        setSuccess('Menu item deleted successfully!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete item';
      setError(message);
    }
  };

  // --- Settings handlers ---
  // Add a new table to the list
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

  // Remove a table from the list
  const handleRemoveTable = (table) => {
    setSettingsData(prev => ({
      ...prev,
      tables: prev.tables.filter(t => t !== table)
    }));
  };

  // Apply a preset palette
  const handlePresetClick = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  // Submit settings update (with files, theme, etc.)
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('whatsappNumber', settingsData.whatsappNumber);
      formDataToSend.append('cafeName', settingsData.cafeName);
      formDataToSend.append('tables', settingsData.tables.join(','));
      formDataToSend.append('primaryColor', primaryColor);
      formDataToSend.append('secondaryColor', secondaryColor);
      formDataToSend.append('mode', themeMode);

      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (faviconFile) {
        formDataToSend.append('favicon', faviconFile);
      }

      const response = await api.put('/settings', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const data = response.data.data;
        // Update admin context
        updateAdminData({
          whatsappNumber: data.whatsappNumber,
          cafeName: data.cafeName,
        });
        // Update local settings state
        setSettingsData({
          whatsappNumber: data.whatsappNumber,
          cafeName: data.cafeName,
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          tables: data.tables || [],
        });
        if (data.theme) {
          setPrimaryColor(data.theme.primaryColor || '#d4a843');
          setSecondaryColor(data.theme.secondaryColor || '#b8860b');
          setThemeMode(data.theme.mode || 'light');
        }
        // Clear file inputs
        setLogoFile(null);
        setFaviconFile(null);
        // Close settings panel
        setIsSettingsOpen(false);
        // Refresh settings
        await fetchSettings();
        setSuccess('Settings updated successfully!');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update settings';
      setError(message);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Submit credentials update (username / password)
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!oldPassword) {
      setError('Please enter your current password to save changes.');
      return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    setCredentialsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.put('/auth/update-credentials', {
        newUsername,
        oldPassword,
        newPassword
      });
      
      if (response.data.success) {
        setSuccess('Credentials updated successfully!');
        // Update auth context data (username)
        updateAdminData({ username: response.data.data.username });
        // Clear passwords fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error updating credentials:', err);
      setError(err.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setCredentialsLoading(false);
    }
  };

  // Download QR code
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'cafe-menu-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {admin.cafeName}
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
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
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
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              {/* Cafe Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cafe Name
                </label>
                <input
                  type="text"
                  value={settingsData.cafeName}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, cafeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number (with country code, no spaces)
                </label>
                <input
                  type="tel"
                  value={settingsData.whatsappNumber}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="923001234567"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo Image
                </label>
                <div className="flex items-center gap-4">
                  {settingsData.logoUrl && (
                    <img src={settingsData.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-sm">{logoFile ? logoFile.name : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => setLogoFile(null)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon
                </label>
                <div className="flex items-center gap-4">
                  {settingsData.faviconUrl && (
                    <img src={settingsData.faviconUrl} alt="Favicon" className="w-10 h-10 object-cover rounded border border-gray-200" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-sm">{faviconFile ? faviconFile.name : 'Upload Favicon'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconChange}
                      className="hidden"
                    />
                  </label>
                  {faviconFile && (
                    <button
                      type="button"
                      onClick={() => setFaviconFile(null)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Tables Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Tables
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settingsData.tables.map((table) => (
                    <span
                      key={table}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {table}
                      <button
                        type="button"
                        onClick={() => handleRemoveTable(table)}
                        className="hover:text-red-600"
                      >
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
                    placeholder="e.g., 6, Patio, VIP"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTable}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* ======== Theme Customization Section ======== */}
              <div className="border-t border-gray-200 pt-6 mt-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customize Your Theme</h3>
                
                {/* Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Theme Mode</span>
                  <button
                    type="button"
                    onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    {themeMode === 'light' ? (
                      <>
                        <Sun size={16} className="text-yellow-500" />
                        <span>Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={16} className="text-indigo-500" />
                        <span>Dark</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Palettes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preset Palettes</label>
                  <div className="flex flex-wrap gap-3">
                    {presetPalettes.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 transition"
                      >
                        <span className="flex gap-1">
                          <span
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </span>
                        <span className="text-xs text-gray-600">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Live Preview</h4>
                  <div
                    className="p-4 rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: themeMode === 'light' ? '#f8fafc' : '#1e293b',
                      color: themeMode === 'light' ? '#0f172a' : '#f1f5f9',
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="flex justify-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Primary
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        Secondary
                      </span>
                    </div>
                    <p className="text-xs text-center mt-2" style={{ color: secondaryColor }}>
                      Accent color example
                    </p>
                  </div>
                </div>
              </div>

              {/* Save / Cancel Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {settingsLoading ? 'Saving...' : 'Save All Settings'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setLogoFile(null);
                    setFaviconFile(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Account Settings Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Username & Password</h3>
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Username
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      minLength={3}
                      maxLength={30}
                    />
                  </div>

                  {/* Old Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="Required to save changes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Leave blank to keep current"
                      minLength={6}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={credentialsLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {credentialsLoading ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        <div className="mb-6 bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <QrCode size={24} className="text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Menu QR Code</h3>
                <p className="text-sm text-gray-500">Scan to view the menu on your phone</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <QRCode
                  id="qr-code-canvas"
                  value={qrValue}
                  size={80}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <button
                onClick={downloadQR}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
              >
                Download QR
              </button>
            </div>
          </div>
        </div>

        {/* Menu Management */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          {/* Menu header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Menu size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Menu Items</h2>
              <span className="text-sm text-gray-500">({menuItems.length})</span>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>

          {/* Add/Edit Form */}
          {isFormOpen && (
            <div className="p-4 border-b border-gray-100 bg-gray-50 animate-fade-in">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      placeholder="e.g., Burgers, Drinks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <Upload size={16} className="text-gray-500" />
                        <span className="text-sm">Choose Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {imagePreview && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      Available
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    <Save size={16} />
                    {formLoading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Menu List */}
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
                  {menuItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">Rs. {item.price}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
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