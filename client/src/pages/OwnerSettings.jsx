// src/pages/OwnerSettings.jsx - Cafe owner settings (refactored)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Settings, Lock, Save, X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import SettingsLayout from '../components/layout/SettingsLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const OwnerSettings = () => {
  const { user, logout, updateUserData } = useAuth();
  const navigate = useNavigate();

  // --- Active tab ---
  const [activeTab, setActiveTab] = useState('cafe');

  // --- Cafe Settings State ---
  const [cafeName, setCafeName] = useState(user?.cafeName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [tables, setTables] = useState(user?.tables || []);
  const [newTableInput, setNewTableInput] = useState('');
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(user?.faviconUrl || '');
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  // --- Password state ---
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // --- Loading & messages ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Handlers ---
  const handleAddTable = () => {
    const val = newTableInput.trim();
    if (val && !tables.includes(val)) {
      setTables([...tables, val]);
      setNewTableInput('');
    }
  };

  const handleRemoveTable = (table) => {
    setTables(tables.filter(t => t !== table));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('cafeName', cafeName);
      formData.append('whatsappNumber', whatsappNumber);
      formData.append('tables', tables.join(','));
      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);

      const response = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const data = response.data.data;
        updateUserData({
          cafeName: data.cafeName,
          whatsappNumber: data.whatsappNumber,
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          tables: data.tables || [],
        });
        setLogoUrl(data.logoUrl || '');
        setFaviconUrl(data.faviconUrl || '');
        setLogoFile(null);
        setFaviconFile(null);
        setSuccess('Settings updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // --- Password handlers ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const response = await api.put('/auth/change-password', passwordForm);
      if (response.data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // --- Sidebar navigation items ---
  const navItems = [
    { id: 'cafe', label: 'Cafe Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  // --- Render content based on active tab ---
  const renderContent = () => {
    if (activeTab === 'cafe') {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>Cafe Settings</h2>
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
          <form onSubmit={handleSettingsSubmit} className="space-y-5">
            <Input
              label="Cafe Name"
              name="cafeName"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              required
            />
            <Input
              label="WhatsApp Number"
              name="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              type="tel"
              placeholder="923001234567"
              required
            />

            {/* Tables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tables (comma separated)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tables.map(table => (
                  <span key={table} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30">
                    {table}
                    <button type="button" onClick={() => handleRemoveTable(table)} className="hover:text-red-600">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTableInput}
                  onChange={(e) => setNewTableInput(e.target.value)}
                  placeholder="e.g., 6, VIP, Patio"
                  className="flex-1"
                />
                <Button variant="primary" onClick={handleAddTable} className="px-4 py-2">
                  Add
                </Button>
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl && <img src={logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />}
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload size={16} className="text-gray-500" />
                  <span className="text-sm">{logoFile ? logoFile.name : 'Upload Logo'}</span>
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon (for customer menu)</label>
              <div className="flex items-center gap-4">
                {faviconUrl && <img src={faviconUrl} alt="Favicon" className="w-10 h-10 object-cover rounded border border-gray-200" />}
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload size={16} className="text-gray-500" />
                  <span className="text-sm">{faviconFile ? faviconFile.name : 'Upload Favicon'}</span>
                  <input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">This favicon will appear on your public menu page.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-2">
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>Cancel</Button>
            </div>
          </form>
        </div>
      );
    }

    if (activeTab === 'security') {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
            <Lock size={20} style={{ color: 'var(--primary-color)' }} />
            Change Password
          </h2>
          {passwordError && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{passwordSuccess}</div>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              type="password"
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              type="password"
              required
              minLength={6}
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              type="password"
              required
            />
            <Button type="submit" variant="primary" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <SettingsLayout
      title="Settings"
      subtitle="Owner"
      backTo="/admin/dashboard"
      onLogout={handleLogout}
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </SettingsLayout>
  );
};

export default OwnerSettings;