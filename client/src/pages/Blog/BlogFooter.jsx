// src/pages/Blog/BlogFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CafeFlow';

const BlogFooter = ({ scrollToTop }) => {
  return (
    <footer
      className="border-t-4 border-[#3E2723] py-6 px-4 mt-8 relative"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div className="max-w-7xl mx-auto text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        <p>
          © {new Date().getFullYear()} {BRAND_NAME}. Built for cafe owners, by cafe lovers.
        </p>
        <p className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link
            to="/"
            className="transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Home
          </Link>
          <a
            href="/blog#howCreateAccount"
            className="transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            How to Create Account
          </a>
          <Link
            to="/admin"
            className="transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Login
          </Link>
        </p>
      </div>
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 p-3 text-white border-2 border-[#3E2723] shadow-[4px_4px_0px_0px_#3E2723] hover:shadow-none transition-all"
        style={{
          backgroundColor: 'var(--primary-color)',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.8)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--primary-color)';
        }}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
};

export default BlogFooter;