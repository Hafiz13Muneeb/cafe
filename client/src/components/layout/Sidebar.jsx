// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Users, Settings, BarChart3, QrCode, CreditCard } from 'lucide-react';

const Sidebar = ({ user }) => {
  const isSuperAdmin = user?.role === 'superadmin';
  
  const navItems = isSuperAdmin
    ? [
        { to: '/admin/super', label: 'Owners', icon: Users },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { to: '/admin/dashboard', label: 'Menu', icon: Menu },
        { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { to: '/admin/qr', label: 'QR Code', icon: QrCode },
        { to: '/admin/subscription', label: 'Subscription', icon: CreditCard }, // 🆕
        { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
      ];

  return (
    <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2">
      {navItems.map((item) => {
        // For pages that should not highlight sub‑routes, set `end` to true
        const shouldEnd = ['/admin/dashboard', '/admin/qr', '/admin/subscription'].includes(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={shouldEnd}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold transition-all ${
                isActive
                  ? 'bg-[#8A9A5B] text-white border-2 border-[#3E2723]'
                  : 'text-[#3E2723] hover:bg-[#EAE0C8]'
              }`
            }
          >
            <item.icon size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.label.charAt(0)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Sidebar;