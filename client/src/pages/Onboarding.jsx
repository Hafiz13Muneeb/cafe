// src/pages/Onboarding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUser } from '../store/slices/authSlice';
import { selectTheme, updateTheme as updateThemeAction } from '../store/slices/themeSlice';
import api from '../api/axios';
import { Save, SkipForward, Palette, Smartphone, Users, Coffee, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const theme = useSelector(selectTheme);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [cafeName, setCafeName] = useState(user?.cafeName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [tables, setTables] = useState((user?.tables || []).join(', '));
  const [currency, setCurrency] = useState(user?.currency || 'Rs');
  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '#d4a843');
  const [secondaryColor, setSecondaryColor] = useState(theme?.secondaryColor || '#b8860b');
  const [mode, setMode] = useState(theme?.mode || 'light');

  useEffect(() => {
    if (user) {
      setCafeName(user.cafeName || '');
      setWhatsappNumber(user.whatsappNumber || '');
      setTables((user.tables || []).join(', '));
      setCurrency(user.currency || 'Rs');
    }
    if (theme) {
      setPrimaryColor(theme.primaryColor || '#d4a843');
      setSecondaryColor(theme.secondaryColor || '#b8860b');
      setMode(theme.mode || 'light');
    }
  }, [user, theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!cafeName.trim()) {
      setError('Cafe name is required.');
      return;
    }
    const trimmedTables = tables
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    if (trimmedTables.length === 0) {
      setError('Please enter at least one table number/name.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cafeName: cafeName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        tables: trimmedTables,
        currency: currency.trim(),
        primaryColor,
        secondaryColor,
        mode,
      };
      const response = await api.put('/settings', payload);
      if (response.data.success) {
        dispatch(updateUser({
          cafeName: cafeName.trim(),
          whatsappNumber: whatsappNumber.trim(),
          tables: trimmedTables,
          currency: currency.trim(),
        }));
        dispatch(updateThemeAction({ primaryColor, secondaryColor, mode }));
        setSuccess('Settings saved! Redirecting...');
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <div
        className="w-full max-w-2xl border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-block p-4 rounded-full border-2 border-[#3E2723] mb-4"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
            Welcome, {user?.username}!
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Let's set up your cafe in a few steps.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold flex items-center gap-2 text-sm sm:text-base">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 border-2 border-green-500 bg-green-100 text-green-700 font-bold flex items-center gap-2 text-sm sm:text-base">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cafe Name"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              leftIcon={Coffee}
              required
              placeholder="e.g. My Awesome Cafe"
            />
            <Input
              label="WhatsApp Number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              leftIcon={Smartphone}
              placeholder="e.g. 03001234567"
              required
            />
          </div>

          <Input
            label="Table Numbers / Names (comma separated)"
            value={tables}
            onChange={(e) => setTables(e.target.value)}
            leftIcon={Users}
            placeholder="1, 2, 3, 4, 5"
            required
          />

          <Input
            label="Currency Symbol"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            leftIcon={CreditCard}
            placeholder="e.g. Rs, $, €"
            required
          />

          <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
              <Palette size={18} /> Theme Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Mode
              </label>
              <div className="flex gap-3">
                {['light', 'dark'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className="px-4 py-2 border-2 border-[#3E2723] font-bold transition text-sm"
                    style={{
                      backgroundColor: mode === m ? 'var(--primary-color)' : 'var(--card-bg)',
                      color: mode === m ? '#ffffff' : 'var(--text-color)',
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== m) {
                        e.target.style.backgroundColor = 'var(--secondary-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== m) {
                        e.target.style.backgroundColor = 'var(--card-bg)';
                      }
                    }}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 justify-center"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={16} className="inline mr-2" /> Complete Setup
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSkip}
              className="flex-1 justify-center"
            >
              <SkipForward size={16} className="inline mr-2" /> Skip for now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;