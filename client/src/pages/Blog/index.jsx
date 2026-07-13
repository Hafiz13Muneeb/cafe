// src/pages/Blog/index.jsx
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../../config/blogPosts';
import BlogHeader from './BlogHeader';
import BlogSidebar from './BlogSidebar';
import BlogArticle from './BlogArticle';
import BlogFooter from './BlogFooter';

const Blog = () => {
  const [activePostId, setActivePostId] = useState(BLOG_POSTS[0]?.id || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const topRef = useRef(null);
  const contentRef = useRef(null);

  // Read hash on mount and update active post
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const found = BLOG_POSTS.find((post) => post.id === hash);
    if (found) {
      setActivePostId(found.id);
    } else {
      const firstId = BLOG_POSTS[0]?.id;
      if (firstId && window.location.hash !== `#${firstId}`) {
        window.history.replaceState(null, '', `#${firstId}`);
        setActivePostId(firstId);
      }
    }
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const found = BLOG_POSTS.find((post) => post.id === hash);
      if (found) {
        setActivePostId(found.id);
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setSidebarOpen(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const activePost = BLOG_POSTS.find((post) => post.id === activePostId) || BLOG_POSTS[0];

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div
      ref={topRef}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <BlogHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
        <BlogSidebar
          activePostId={activePostId}
          setActivePostId={setActivePostId}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main ref={contentRef} className="flex-1 min-w-0 space-y-8">
          <BlogArticle activePost={activePost} fadeInUp={fadeInUp} />
          {/* Bottom CTA */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center border-4 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <h2 className="text-xl sm:text-2xl font-bold font-['Permanent_Marker']" style={{ color: 'var(--text-color)' }}>
              Ready to Transform Your Tables?
            </h2>
            <p className="mt-2 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Join hundreds of cafe owners already using {import.meta.env.VITE_BRAND_NAME || 'CafeFlow'} to take orders digitally.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/admin"
                className="px-8 py-3 text-white font-bold border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] hover:shadow-none transition-all"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Send size={18} className="inline mr-2" /> Get Started Now
              </Link>
              <a
                href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'support@cafeflow.com'}`}
                className="px-8 py-3 font-bold border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_var(--secondary-color)] hover:shadow-none transition-all"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                }}
              >
                <Mail size={18} className="inline mr-2" /> Contact Sales
              </a>
            </div>
          </motion.div>
        </main>
      </div>

      <BlogFooter scrollToTop={scrollToTop} />
    </div>
  );
};

export default Blog;