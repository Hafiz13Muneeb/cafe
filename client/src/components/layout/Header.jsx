// src/components/layout/Header.jsx
import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import Button from '../common/Button';

const Header = ({ title, subtitle, onLogout, user }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => window.location.href = '/admin/settings'} className="p-2">
            <Settings size={20} />
          </Button>
          <Button variant="secondary" onClick={onLogout} className="p-2">
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;