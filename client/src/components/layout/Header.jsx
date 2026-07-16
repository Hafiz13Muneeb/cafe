// src/components/layout/Header.jsx - Hamburger menu for mobile
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import Button from '../common/Button';

const Header = ({ title, subtitle, onLogout, user, onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/admin/dashboard/settings');
  };

  return (
    <header className="bg-[var(--card-bg)] border-b-4 border-[var(--border-color)] sticky top-0 z-20">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Hamburger button – visible on mobile */}
          <button
            onClick={onToggleSidebar}
            className="sm:hidden p-1.5 border-2 border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-color)] transition"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="text-base sm:text-xl font-bold font-['Permanent_Marker'] text-[var(--text-color)] truncate">
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary text-white font-bold border-2 border-[var(--border-color)] whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="secondary"
            onClick={handleSettingsClick}
            className="p-1.5 sm:p-2"
          >
            <Settings size={16} className="sm:w-5 sm:h-5" />
          </Button>
          <Button variant="danger" onClick={onLogout} className="p-1.5 sm:p-2">
            <LogOut size={16} className="sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;