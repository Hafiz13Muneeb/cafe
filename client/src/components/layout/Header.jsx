// src/components/layout/Header.jsx
import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import Button from '../common/Button';

const Header = ({ title, subtitle, onLogout, user }) => {
  const settingsPath = user?.role === 'superadmin' ? '/admin/settings' : '/admin/dashboard/settings';

  return (
    <header className="bg-white border-b-4 border-[#3E2723] sticky top-0 z-20">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-base sm:text-xl font-bold font-['Permanent_Marker'] text-[#3E2723] truncate">
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#8A9A5B] text-white font-bold border-2 border-[#3E2723] whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="secondary"
            onClick={() => window.location.href = settingsPath}
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