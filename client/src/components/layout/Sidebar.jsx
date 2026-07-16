// src/components/layout/Sidebar.jsx - Always show full labels, no truncation
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Settings, BarChart3, QrCode, HelpCircle } from 'lucide-react';

const Sidebar = ({ user, onLinkClick }) => {
  const navItems = [
    { to: '/admin/dashboard', label: 'Menu', icon: Menu, end: true },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, end: false },
    { to: '/admin/qr', label: 'QR Code', icon: QrCode, end: true },
    { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle, end: true },
    { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings, end: false },
  ];

  return (
    <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2 h-full">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold transition-all ${
              isActive
                ? 'bg-primary text-white border-2 border-[var(--border-color)]'
                : 'text-[var(--text-color)] hover:bg-[var(--bg-color)]'
            }`
          }
        >
          <item.icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
          {/* Always show full label – no conditional hiding */}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;