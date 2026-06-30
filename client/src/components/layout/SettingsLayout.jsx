import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

const SettingsLayout = ({ children, title, navItems, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-3 sm:p-4">
      <header className="bg-white border-2 border-[#3E2723] p-3 sm:p-4 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3" style={{ boxShadow: "4px 4px 0px 0px #3E2723" }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-1.5 sm:p-2 hover:bg-[#EAE0C8] border-2 border-[#3E2723] flex-shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-base sm:text-xl font-bold font-['Permanent_Marker'] text-[#3E2723] truncate">{title}</h1>
        </div>
        <Button variant="danger" onClick={() => navigate('/admin')} className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
          Logout
        </Button>
      </header>

      <div className="container mx-auto flex flex-col md:flex-row gap-4 sm:gap-6">
        <aside className="w-full md:w-56 lg:w-64">
          <div className="bg-white border-2 border-[#3E2723] p-1 sm:p-2 space-y-1 sm:space-y-2 flex flex-row md:flex-col overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold transition-all whitespace-nowrap ${
                  activeTab === item.id ? 'bg-[#8A9A5B] text-white' : 'hover:bg-[#EAE0C8]'
                }`}
              >
                <item.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default SettingsLayout;