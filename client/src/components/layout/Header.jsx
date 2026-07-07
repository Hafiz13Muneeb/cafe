// src/components/layout/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import Button from '../common/Button';
import NotificationBell from '../common/NotificationBell';

const Header = ({ title, subtitle, onLogout, user }) => {
  const navigate = useNavigate();
  
  const settingsPath = user?.role === 'superadmin' ? '/admin/settings' : '/admin/dashboard/settings';

  const handleSettingsClick = () => {
    navigate(settingsPath);
  };

  return (
    <header 
      className="border-b-4 border-[#3E2723] sticky top-0 z-20"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 
            className="text-base sm:text-xl font-bold font-['Permanent_Marker'] truncate"
            style={{ color: 'var(--text-color)' }}
          >
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <span 
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold border-2 border-[#3E2723] whitespace-nowrap"
              style={{ 
                backgroundColor: 'var(--primary-color)',
                color: '#ffffff'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />
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