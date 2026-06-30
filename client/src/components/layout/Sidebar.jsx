import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Users, Settings } from 'lucide-react';

const Sidebar = ({ user }) => {
  const navItems = user?.role === 'superadmin'
    ? [{ to: '/admin/super', label: 'Owners', icon: Users }, { to: '/admin/settings', label: 'Settings', icon: Settings }]
    : [{ to: '/admin/dashboard', label: 'Menu', icon: Menu }, { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings }];

  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to}
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 font-bold transition-all ${isActive ? 'bg-[#8A9A5B] text-white border-2 border-[#3E2723]' : 'text-[#3E2723] hover:bg-[#EAE0C8]'}`}>
          <item.icon size={20} /> {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;