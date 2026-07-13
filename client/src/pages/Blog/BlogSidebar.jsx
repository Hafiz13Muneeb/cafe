// src/pages/Blog/BlogSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Send } from 'lucide-react';
import { BLOG_POSTS } from '../../config/blogPosts';

const BlogSidebar = ({ activePostId, setActivePostId, sidebarOpen, setSidebarOpen }) => {
  const handlePostClick = (postId) => {
    setActivePostId(postId);
    setSidebarOpen(false);
    window.location.hash = postId;
  };

  return (
    <aside
      className={`
        md:w-64 lg:w-72 flex-shrink-0
        ${sidebarOpen ? 'block' : 'hidden'} md:block
        fixed md:sticky top-20 md:top-24 left-0 right-0 z-40 md:z-auto
        border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_var(--secondary-color)]
        max-h-[calc(100vh-100px)] overflow-y-auto p-4 mx-4 md:mx-0
        md:max-h-[calc(100vh-120px)]
      `}
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <h3 className="font-bold font-['Permanent_Marker'] text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
        <Menu size={18} style={{ color: 'var(--primary-color)' }} /> All Blogs
      </h3>
      <nav className="space-y-1">
        {BLOG_POSTS.map((post) => (
          <div key={post.id}>
            <button
              onClick={() => handlePostClick(post.id)}
              className="block w-full text-left px-3 py-2 border-l-4 font-bold text-sm transition-all"
              style={{
                borderColor: activePostId === post.id ? 'var(--primary-color)' : 'transparent',
                backgroundColor: activePostId === post.id ? 'var(--secondary-color)' : 'transparent',
                color: activePostId === post.id ? 'var(--text-color)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (activePostId !== post.id) {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                  e.currentTarget.style.color = 'var(--text-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (activePostId !== post.id) {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {post.title}
            </button>
            {activePostId === post.id && (
              <ul className="ml-4 mt-1 space-y-0.5 border-l-2 pl-3" style={{ borderColor: 'var(--secondary-color)' }}>
                {post.subtopics.map((sub, idx) => (
                  <li key={idx} className="text-xs flex items-center gap-1.5 py-0.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }} />
                    {sub}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-6 pt-4 border-t-2" style={{ borderColor: 'var(--secondary-color)' }}>
        <Link
          to="/admin"
          className="block w-full text-center px-4 py-2 text-white font-bold border-2 border-[#3E2723] shadow-[4px_4px_0px_0px_#3E2723] hover:shadow-none transition-all text-sm"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <Send size={14} className="inline mr-2" /> Login to Dashboard
        </Link>
      </div>
    </aside>
  );
};

export default BlogSidebar;