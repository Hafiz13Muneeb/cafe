// src/pages/Blog/BlogHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowLeft, Menu, X } from 'lucide-react';

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CafeFlow';

const BlogHeader = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm border-b-4 border-[#3E2723] py-3 px-4 sm:px-6"
      style={{
        backgroundColor: 'var(--card-bg)',
        boxShadow: '0 4px 0 0 var(--primary-color)',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coffee size={28} style={{ color: 'var(--primary-color)' }} />
          <span
            className="text-2xl font-bold font-['Permanent_Marker']"
            style={{ color: 'var(--text-color)' }}
          >
            {BRAND_NAME}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 border-2 border-[#3E2723] transition"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-color)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card-bg)'}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} style={{ color: 'var(--text-color)' }} /> : <Menu size={20} style={{ color: 'var(--text-color)' }} />}
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold transition"
            style={{ color: 'var(--text-color)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-color)'}
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default BlogHeader;