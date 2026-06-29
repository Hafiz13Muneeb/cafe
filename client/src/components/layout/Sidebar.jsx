// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Users, Settings } from 'lucide-react';

const Sidebar = ({ user }) => {
  const isSuperAdmin = user?.role === 'superadmin';

  const navItems = isSuperAdmin
    ? [
        { to: '/admin/super', label: 'Owners', icon: Users },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { to: '/admin/dashboard', label: 'Menu', icon: Menu },
        { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
      ];

  return (
    <nav className="p-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary border-r-4 border-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
          style={({ isActive }) => isActive ? { borderColor: 'var(--primary-color)' } : {}}
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;