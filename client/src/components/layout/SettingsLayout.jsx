import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

const SettingsLayout = ({ children, title, navItems, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4">
      <header className="bg-white border-2 border-[#3E2723] p-4 mb-6 flex justify-between items-center" style={{ boxShadow: "4px 4px 0px 0px #3E2723" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#EAE0C8] border-2 border-[#3E2723]"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-bold font-['Permanent_Marker'] text-[#3E2723]">{title}</h1>
        </div>
        <Button variant="danger" onClick={() => navigate('/admin')}>Logout</Button>
      </header>

      <div className="container mx-auto flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64">
          <div className="bg-white border-2 border-[#3E2723] p-2 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold transition-all ${activeTab === item.id ? 'bg-[#8A9A5B] text-white' : 'hover:bg-[#EAE0C8]'}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default SettingsLayout;