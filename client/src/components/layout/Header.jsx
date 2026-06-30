// src/components/layout/Header.jsx
import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import Button from '../common/Button';

const Header = ({ title, subtitle, onLogout, user }) => {
  const settingsPath = user?.role === 'superadmin' ? '/admin/settings' : '/admin/dashboard/settings';

  return (
    <header className="bg-white border-b-4 border-[#3E2723] sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <span className="text-xs px-2 py-1 bg-[#8A9A5B] text-white font-bold border-2 border-[#3E2723]">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => window.location.href = settingsPath}
            className="p-2"
          >
            <Settings size={20} />
          </Button>
          <Button variant="danger" onClick={onLogout} className="p-2">
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;