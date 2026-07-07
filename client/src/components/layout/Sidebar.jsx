// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Users, Settings, BarChart3, QrCode, CreditCard, Bell } from 'lucide-react';

const Sidebar = ({ user }) => {
  const isSuperAdmin = user?.role === 'superadmin';
  
  const navItems = isSuperAdmin
    ? [
        { to: '/admin/super', label: 'Owners', icon: Users },
        { to: '/admin/notifications', label: 'Notifications', icon: Bell },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { to: '/admin/dashboard', label: 'Menu', icon: Menu },
        { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { to: '/admin/qr', label: 'QR Code', icon: QrCode },
        { to: '/admin/subscription', label: 'Subscription', icon: CreditCard },
        { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
      ];

  return (
    <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2">
      {navItems.map((item) => {
        const shouldEnd = ['/admin/dashboard', '/admin/qr', '/admin/subscription', '/admin/notifications'].includes(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={shouldEnd}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold transition-all border-2 ${
                isActive 
                  ? 'border-[#3E2723]' 
                  : 'border-transparent hover:bg-primary-light'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-color)',
            })}
          >
            <item.icon size={18} className="sm:w-5 sm:h-5" />
            <span className="inline">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Sidebar;