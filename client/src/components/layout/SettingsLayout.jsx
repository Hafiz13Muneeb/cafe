// src/components/layout/SettingsLayout.jsx - Shared settings layout with sidebar
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import Button from '../common/Button';

const SettingsLayout = ({
  children,
  title,
  subtitle,
  backTo,
  onLogout,
  navItems,
  activeTab,
  setActiveTab,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
              title="Back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
              {title || 'Settings'}
            </h1>
            {subtitle && (
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                {subtitle}
              </span>
            )}
          </div>
          <Button variant="secondary" onClick={onLogout} className="flex items-center gap-2">
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 max-w-6xl">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-soft overflow-hidden sticky top-24">
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary border-r-4 border-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={activeTab === item.id ? { borderColor: 'var(--primary-color)' } : {}}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            {/* Logout at bottom (optional, but we already have header logout) */}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;