// src/components/layout/DashboardLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWidget from '../common/ChatWidget'; // 🆕 import ChatWidget

const DashboardLayout = ({ children, title, subtitle, showSidebar = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
      <Header title={title} subtitle={subtitle} onLogout={handleLogout} user={user} />
      <div className="flex flex-col sm:flex-row">
        {showSidebar && (
          <aside className="w-full sm:w-56 md:w-64 flex-shrink-0 border-b-2 sm:border-b-0 sm:border-r-4 border-[#3E2723]">
            <Sidebar user={user} />
          </aside>
        )}
        <main className="flex-1 p-3 sm:p-6 overflow-x-auto">{children}</main>
      </div>
      {/* 🆕 ChatWidget – appears on all dashboard pages (auto‑hidden for superadmin) */}
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;