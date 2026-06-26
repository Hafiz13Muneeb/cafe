// src/pages/AdminDashboard.jsx - Cafe owner dashboard (menu management & QR)
import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2,
} from 'lucide-react';
import QRCode from 'qrcode.react';

// --- Helper Components (kept inside for modularity) ---
const PrimaryButton = ({ children, onClick, disabled, className = '', ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 hover:opacity-90 active:scale-95 shadow-md ${className}`}
    style={{ backgroundColor: 'var(--primary-color)' }}
    {...props}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const InputField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
      style={{ '--tw-ring-color': 'var(--primary-color)' }}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, rows = 2, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
      style={{ '--tw-ring-color': 'var(--primary-color)' }}
    />
  </div>
);

// --- Main Component ---
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/admin');
  }, [user, navigate]);

  // --- State ---
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '', isAvailable: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // QR code state
  const [qrValue, setQrValue] = useState('');
  const [cafeSlug, setCafeSlug] = useState(user?.slug || '');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (success) setTimeout(() => setSuccess(''), 3000);
  }, [success]);

  useEffect(() => {
    if (user?.slug) {
      setQrValue(`${window.location.origin}/menu/${user.slug}`);
      setCafeSlug(user.slug);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMenuItems();
    }
  }, [user]);

  // --- API calls ---
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/menu?all=true');
      if (response.data.success) setMenuItems(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // --- Menu form handlers ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
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
      if (imageFile) formDataToSend.append('image', imageFile);

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

  // --- Enhanced QR code download ---
  const downloadQR = () => {
    const qrCanvas = document.getElementById('qr-code-canvas');
    if (!qrCanvas) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 400;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Cafe name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(user?.cafeName || 'Cafe Menu', width/2, 30);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText('Scan to view menu', width/2, 70);

    // QR code
    ctx.drawImage(qrCanvas, (width - 200) / 2, 110, 200, 200);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText(`/${user?.slug || 'menu'}`, width/2, 340);

    const link = document.createElement('a');
    link.download = `cafe-${cafeSlug}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!user) return null;

  // ---- Render helpers ----
  const renderMessages = () => (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm flex items-start gap-2">
          <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
    </>
  );

  const renderQRCode = () => (
    <div className="mb-6 bg-white rounded-xl shadow-soft p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <QrCode size={24} className="text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-800">Menu QR Code</h3>
            <p className="text-sm text-gray-500">Scan to view your menu: /menu/{cafeSlug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm shadow-sm"
          >
            <Maximize2 size={16} />
            Show QR Code
          </button>
          <button
            onClick={downloadQR}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition shadow-md text-sm"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            Download QR
          </button>
        </div>
      </div>
    </div>
  );

  // ---- QR Modal ----
  const renderQRModal = () => {
    if (!isQRModalOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsQRModalOpen(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setIsQRModalOpen(false)}
            className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-500 hover:text-gray-700" />
          </button>

          {/* Content */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{user?.cafeName || 'Cafe Menu'}</h2>
            <p className="text-sm text-gray-500 mb-4">Scan to view menu</p>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm inline-block mx-auto">
              <QRCode
                value={qrValue}
                size={280}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            <p className="text-xs text-gray-400 mt-4">/{user?.slug || 'menu'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMenuForm = () => (
    <div className="p-4 border-b border-gray-100 bg-gray-50 animate-fade-in">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Title *" name="title" value={formData.title} onChange={handleFormChange} required />
          <InputField label="Price (Rs.) *" name="price" value={formData.price} onChange={handleFormChange} type="number" required min="0" step="0.01" />
          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleFormChange} className="md:col-span-2" />
          <InputField label="Category *" name="category" value={formData.category} onChange={handleFormChange} required placeholder="e.g., Burgers" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
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
              <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleFormChange} className="w-4 h-4 text-primary rounded" style={{ accentColor: 'var(--primary-color)' }} />
              Available
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={formLoading} className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-md" style={{ backgroundColor: 'var(--primary-color)' }}>
            <Save size={16} /> {formLoading ? 'Saving...' : editingItem ? 'Update' : 'Add Item'}
          </button>
          <SecondaryButton onClick={() => { setIsFormOpen(false); setImageFile(null); setImagePreview(''); }}>Cancel</SecondaryButton>
        </div>
      </form>
    </div>
  );

  const renderMenuTable = () => (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-primary border-t-transparent" style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}></div>
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
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${item.isAvailable ? 'bg-primary/20 text-primary border-primary/30' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ----- Main Render -----
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{user.cafeName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/dashboard/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Logout">
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {renderMessages()}
        {renderQRCode()}
        {renderQRModal()}

        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Menu size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Menu Items ({menuItems.length})</h2>
            </div>
            <button onClick={handleAddNew} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90 transition shadow-md text-sm" style={{ backgroundColor: 'var(--primary-color)' }}>
              <Plus size={16} /> Add New
            </button>
          </div>

          {isFormOpen && renderMenuForm()}
          {renderMenuTable()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;