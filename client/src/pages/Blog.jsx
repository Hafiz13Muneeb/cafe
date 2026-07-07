// src/pages/Blog.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  Coffee,
  ArrowLeft,
  Users,
  Zap,
  Mail,
  Send,
  ArrowUp,
  Menu,
  X,
  CheckCircle,
  Shield,
  Palette,
  BarChart3,
  Settings,
  Smartphone,
  DollarSign,
} from 'lucide-react';

// ------------------------------------------------
// 1. CONFIGURATION – Read from .env
// ------------------------------------------------
const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CafeFlow';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@cafeflow.com';

// ------------------------------------------------
// 2. BLOG POSTS DATA – (Add new posts here to scale)
// ------------------------------------------------
const BLOG_POSTS = [
  {
    id: 'howCreateAccount',
    title: 'How to Create Your Account',
    subtopics: ['Contact Us', 'Receive Credentials', 'Set Up Menu', 'Start Taking Orders'],
    render: () => (
      <div className="space-y-6">
        <p style={{ color: 'var(--text-secondary)' }}>
          Getting started is quick and free. Follow these steps to set up your digital menu in minutes.
        </p>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Contact Us',
              desc: `Reach out via our <a href="/contact" style="color: var(--primary-color); text-decoration: underline;">contact form</a> or email us at <a href="mailto:${CONTACT_EMAIL}" style="color: var(--primary-color); text-decoration: underline;">${CONTACT_EMAIL}</a>. We'll set up your account within 24 hours.`,
            },
            {
              step: 2,
              title: 'Receive Your Credentials',
              desc: 'We\'ll send you a temporary username and password. Use them to log in to your admin dashboard.',
            },
            {
              step: 3,
              title: 'Set Up Your Menu',
              desc: `Log in, upload your cafe logo, add menu items with images, and customise your theme colours. Your public menu will be live instantly at <span style="font-family: monospace; background-color: var(--secondary-color); padding: 0 4px;">/menu/your-cafe</span>.`,
            },
            {
              step: 4,
              title: 'Start Taking Orders',
              desc: 'Place your QR code on tables, and customers can scan, browse, and order directly via WhatsApp. You\'ll receive orders instantly – no commission, no delay.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-4 border-2 transition-all rounded-lg"
              style={{
                borderColor: 'var(--border-color)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--secondary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-8 h-8 flex-shrink-0 text-white font-bold rounded-full flex items-center justify-center text-sm border-2 border-[#3E2723]"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
            </div>
          ))}
        </div>
        <div
          className="border-2 border-[#3E2723] p-4 mt-4 rounded-lg"
          style={{ backgroundColor: 'var(--secondary-color)' }}
        >
          <p className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
            <Shield size={18} /> Already have an account?{' '}
            <Link to="/admin" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
              Log in here
            </Link>
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'why-cafeflow',
    title: 'Why Choose CafeFlow?',
    subtopics: ['Zero Commission', 'Real-time Updates', 'WhatsApp Integration', 'Beautiful Design'],
    render: () => (
      <div className="space-y-6">
        <p style={{ color: 'var(--text-secondary)' }}>
          Here’s why hundreds of cafe owners trust us to power their digital menus every day.
        </p>
        <div className="grid grid-cols-1 gap-4">
          {[
            { icon: DollarSign, title: 'Zero Commission', desc: 'Keep 100% of your revenue. No hidden fees, ever.' },
            { icon: Zap, title: 'Real-time Updates', desc: 'Change prices or availability – updates reflect instantly.' },
            { icon: Smartphone, title: 'WhatsApp Integration', desc: 'Orders come directly to your phone. No app needed.' },
            { icon: Palette, title: 'Beautiful Design', desc: 'Hand‑crafted, mobile‑optimised menus that impress your customers.' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="border-2 border-[#3E2723] p-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--card-bg)',
                boxShadow: '4px 4px 0px 0px var(--secondary-color)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '8px 8px 0px 0px var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--secondary-color)';
              }}
            >
              <div className="flex items-center gap-3">
                <feature.icon size={24} style={{ color: 'var(--primary-color)' }} />
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{feature.title}</h3>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'customization-guide',
    title: 'Customization Guide',
    subtopics: ['Themes & Colors', 'Logo & Favicon', 'Menu Categories', 'Table Management'],
    render: () => (
      <div className="space-y-6">
        <p style={{ color: 'var(--text-secondary)' }}>
          Make your digital menu truly yours with these powerful customization options.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Palette, title: 'Themes & Colors', desc: 'Choose from preset palettes or set your own primary/secondary colours to match your brand.' },
            { icon: Settings, title: 'Logo & Favicon', desc: 'Upload your cafe logo and favicon for a professional, branded experience on every device.' },
            { icon: Coffee, title: 'Menu Categories', desc: 'Organise your items into categories (Burgers, Drinks, Desserts) for easy browsing.' },
            { icon: Users, title: 'Table Management', desc: 'Define custom table numbers/names for your space – orders will ask customers to select one.' },
          ].map((item, idx) => (
            <div key={idx} className="border-2 border-[#3E2723] p-4" style={{ backgroundColor: 'var(--bg-color)' }}>
              <item.icon size={20} style={{ color: 'var(--primary-color)' }} className="mb-2" />
              <h4 className="font-bold" style={{ color: 'var(--text-color)' }}>{item.title}</h4>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'analytics-insights',
    title: 'Analytics & Insights',
    subtopics: ['Track Views', 'Monitor Orders', 'Revenue Tracking', 'Bounce Rate'],
    render: () => (
      <div className="space-y-6">
        <p style={{ color: 'var(--text-secondary)' }}>
          Understand your customers better with built‑in analytics that help you make data‑driven decisions.
        </p>
        <div className="space-y-4">
          {[
            { icon: BarChart3, title: 'Track Views', desc: 'See how many customers are viewing your menu daily and weekly.' },
            { icon: CheckCircle, title: 'Monitor Orders', desc: 'Track order attempts and completed orders to measure conversion.' },
            { icon: DollarSign, title: 'Revenue Tracking', desc: 'Automatically calculate total revenue from orders placed through your menu.' },
            { icon: Zap, title: 'Bounce Rate', desc: 'Understand how many visitors view without ordering – and optimise your menu accordingly.' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
              <item.icon size={20} style={{ color: 'var(--primary-color)' }} className="mt-0.5" />
              <div>
                <h4 className="font-bold" style={{ color: 'var(--text-color)' }}>{item.title}</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ------------------------------------------------
// 3. COMPONENT
// ------------------------------------------------
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
      {/* Header */}
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

      {/* Main Layout: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar */}
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
                <a
                  href={`#${post.id}`}
                  className="block px-3 py-2 border-l-4 font-bold text-sm transition-all"
                  style={{
                    borderColor: activePostId === post.id ? 'var(--primary-color)' : 'transparent',
                    backgroundColor: activePostId === post.id ? 'var(--secondary-color)' : 'transparent',
                    color: activePostId === post.id ? 'var(--text-color)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (activePostId !== post.id) {
                      e.target.style.borderColor = 'var(--primary-color)';
                      e.target.style.backgroundColor = 'var(--bg-color)';
                      e.target.style.color = 'var(--text-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePostId !== post.id) {
                      e.target.style.borderColor = 'transparent';
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {post.title}
                </a>
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

        {/* Main Content Area */}
        <main ref={contentRef} className="flex-1 min-w-0 space-y-8">
          {/* Active Post */}
          <motion.article
            key={activePostId}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="border-4 border-[#3E2723] p-6 sm:p-8 md:p-10"
            style={{
              backgroundColor: 'var(--card-bg)',
              boxShadow: '12px 12px 0px 0px var(--primary-color)',
            }}
          >
            <h1 className="text-2xl sm:text-4xl font-bold font-['Permanent_Marker'] mb-4" style={{ color: 'var(--text-color)' }}>
              {activePost?.title}
            </h1>
            {activePost?.render()}
          </motion.article>

          {/* Bottom CTA (consistent across all posts) */}
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
              Join hundreds of cafe owners already using {BRAND_NAME} to take orders digitally.
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
                href={`mailto:${CONTACT_EMAIL}`}
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

      {/* Footer */}
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
        {/* Back to Top Button */}
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
    </div>
  );
};

export default Blog;