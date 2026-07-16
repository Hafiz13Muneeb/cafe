// src/components/layout/DashboardLayout.jsx - Sidebar fixed height 100vh
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWidget from '../common/ChatWidget';

const DashboardLayout = ({ children, title, subtitle, showSidebar = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] flex flex-col">
      <Header
        title={title}
        subtitle={subtitle}
        onLogout={handleLogout}
        user={user}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 relative">
        {showSidebar && (
          <>
            {/* Mobile overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-[#3E2723]/40 backdrop-blur-sm sm:hidden"
                onClick={closeSidebar}
              />
            )}

            {/* Sidebar – fixed height 100vh on all screens */}
            <aside
              className={`
                fixed sm:sticky top-0 z-40
                w-64 sm:w-56 md:w-64
                h-screen sm:h-screen
                bg-white border-r-4 border-[#3E2723]
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                sm:translate-x-0
                flex-shrink-0
                overflow-y-auto
              `}
            >
              <Sidebar user={user} onLinkClick={closeSidebar} />
            </aside>
          </>
        )}

        <main className="flex-1 p-3 sm:p-6 overflow-x-auto">
          {children}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;