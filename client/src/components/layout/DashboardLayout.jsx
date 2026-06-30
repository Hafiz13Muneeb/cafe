import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

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
      <div className="flex">
        {showSidebar && (
          <aside className="w-64 flex-shrink-0 border-r-4 border-[#3E2723]">
            <Sidebar user={user} />
          </aside>
        )}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;