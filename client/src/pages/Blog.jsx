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
        <p className="text-[#3E2723]/80">
          Getting started is quick and free. Follow these steps to set up your digital menu in minutes.
        </p>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Contact Us',
              desc: `Reach out via our <Link to="/contact" className="text-[#8A9A5B] underline">contact form</Link> or email us at <a href="mailto:${CONTACT_EMAIL}" className="text-[#8A9A5B] underline">${CONTACT_EMAIL}</a>. We'll set up your account within 24 hours.`,
            },
            {
              step: 2,
              title: 'Receive Your Credentials',
              desc: 'We\'ll send you a temporary username and password. Use them to log in to your admin dashboard.',
            },
            {
              step: 3,
              title: 'Set Up Your Menu',
              desc: `Log in, upload your cafe logo, add menu items with images, and customise your theme colours. Your public menu will be live instantly at <span className="font-mono bg-[#EAE0C8] px-1">/menu/your-cafe</span>.`,
            },
            {
              step: 4,
              title: 'Start Taking Orders',
              desc: 'Place your QR code on tables, and customers can scan, browse, and order directly via WhatsApp. You\'ll receive orders instantly – no commission, no delay.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-4 border-2 border-[#3E2723]/10 hover:border-[#8A9A5B] hover:shadow-[4px_4px_0px_0px_#EAE0C8] transition-all rounded-lg"
            >
              <div className="w-8 h-8 flex-shrink-0 bg-[#8A9A5B] text-white font-bold rounded-full flex items-center justify-center text-sm border-2 border-[#3E2723]">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-[#3E2723] text-lg">{item.title}</h3>
                <p className="text-sm text-[#3E2723]/70" dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#EAE0C8] border-2 border-[#3E2723] p-4 mt-4 rounded-lg">
          <p className="text-sm font-bold text-[#3E2723] flex items-center gap-2">
            <Shield size={18} /> Already have an account?{' '}
            <Link to="/admin" className="text-[#8A9A5B] underline hover:no-underline">
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
        <p className="text-[#3E2723]/80">
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
              className="bg-white border-2 border-[#3E2723] p-5 shadow-[4px_4px_0px_0px_#EAE0C8] hover:shadow-[8px_8px_0px_0px_#8A9A5B] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <feature.icon size={24} className="text-[#8A9A5B]" />
                <h3 className="font-bold text-[#3E2723] text-lg">{feature.title}</h3>
              </div>
              <p className="text-sm text-[#3E2723]/70 mt-1">{feature.desc}</p>
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
        <p className="text-[#3E2723]/80">
          Make your digital menu truly yours with these powerful customization options.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Palette, title: 'Themes & Colors', desc: 'Choose from preset palettes or set your own primary/secondary colours to match your brand.' },
            { icon: Settings, title: 'Logo & Favicon', desc: 'Upload your cafe logo and favicon for a professional, branded experience on every device.' },
            { icon: Coffee, title: 'Menu Categories', desc: 'Organise your items into categories (Burgers, Drinks, Desserts) for easy browsing.' },
            { icon: Users, title: 'Table Management', desc: 'Define custom table numbers/names for your space – orders will ask customers to select one.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#FAF9F6] border-2 border-[#3E2723] p-4">
              <item.icon size={20} className="text-[#8A9A5B] mb-2" />
              <h4 className="font-bold text-[#3E2723]">{item.title}</h4>
              <p className="text-xs text-[#3E2723]/70 mt-1">{item.desc}</p>
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
        <p className="text-[#3E2723]/80">
          Understand your customers better with built‑in analytics that help you make data‑driven decisions.
        </p>
        <div className="space-y-4">
          {[
            { icon: BarChart3, title: 'Track Views', desc: 'See how many customers are viewing your menu daily and weekly.' },
            { icon: CheckCircle, title: 'Monitor Orders', desc: 'Track order attempts and completed orders to measure conversion.' },
            { icon: DollarSign, title: 'Revenue Tracking', desc: 'Automatically calculate total revenue from orders placed through your menu.' },
            { icon: Zap, title: 'Bounce Rate', desc: 'Understand how many visitors view without ordering – and optimise your menu accordingly.' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 border-b border-[#3E2723]/10 last:border-0">
              <item.icon size={20} className="text-[#8A9A5B] mt-0.5" />
              <div>
                <h4 className="font-bold text-[#3E2723]">{item.title}</h4>
                <p className="text-sm text-[#3E2723]/70">{item.desc}</p>
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
    const hash = window.location.hash.slice(1); // remove '#'
    const found = BLOG_POSTS.find((post) => post.id === hash);
    if (found) {
      setActivePostId(found.id);
    } else {
      // Fallback to first post, but update URL
      const firstId = BLOG_POSTS[0]?.id;
      if (firstId && window.location.hash !== `#${firstId}`) {
        window.history.replaceState(null, '', `#${firstId}`);
        setActivePostId(firstId);
      }
    }
  }, []);

  // Listen for hash changes (e.g., when user clicks sidebar links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const found = BLOG_POSTS.find((post) => post.id === hash);
      if (found) {
        setActivePostId(found.id);
        // Scroll to top of content on mobile
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setSidebarOpen(false); // close sidebar on mobile
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const activePost = BLOG_POSTS.find((post) => post.id === activePostId) || BLOG_POSTS[0];

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div ref={topRef} className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-4 border-[#3E2723] shadow-[0_4px_0_0_#8A9A5B] py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coffee size={28} className="text-[#8A9A5B]" />
            <span className="text-2xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
              {BRAND_NAME}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 border-2 border-[#3E2723] bg-white hover:bg-[#EAE0C8] transition"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-bold text-[#3E2723] hover:text-[#8A9A5B] transition"
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
            bg-white border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#EAE0C8]
            max-h-[calc(100vh-100px)] overflow-y-auto p-4 mx-4 md:mx-0
            md:max-h-[calc(100vh-120px)]
          `}
        >
          <h3 className="font-bold font-['Permanent_Marker'] text-xl text-[#3E2723] mb-4 flex items-center gap-2">
            <Menu size={18} className="text-[#8A9A5B]" /> All Blogs
          </h3>
          <nav className="space-y-1">
            {BLOG_POSTS.map((post) => (
              <div key={post.id}>
                <a
                  href={`#${post.id}`}
                  className={`
                    block px-3 py-2 border-l-4 font-bold text-sm transition-all
                    ${activePostId === post.id
                      ? 'border-[#8A9A5B] bg-[#EAE0C8] text-[#3E2723]'
                      : 'border-transparent hover:border-[#8A9A5B] hover:bg-[#F5F5DC] text-[#3E2723]/70'
                    }
                  `}
                >
                  {post.title}
                </a>
                {/* Subtopics */}
                {activePostId === post.id && (
                  <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-[#EAE0C8] pl-3">
                    {post.subtopics.map((sub, idx) => (
                      <li key={idx} className="text-xs text-[#3E2723]/60 flex items-center gap-1.5 py-0.5">
                        <span className="w-1 h-1 bg-[#8A9A5B] rounded-full" />
                        {sub}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t-2 border-[#EAE0C8]">
            <Link
              to="/admin"
              className="block w-full text-center px-4 py-2 bg-[#8A9A5B] text-white font-bold border-2 border-[#3E2723] shadow-[4px_4px_0px_0px_#3E2723] hover:shadow-none transition-all text-sm"
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
            className="bg-white border-4 border-[#3E2723] shadow-[12px_12px_0px_0px_#8A9A5B] p-6 sm:p-8 md:p-10"
          >
            <h1 className="text-2xl sm:text-4xl font-bold font-['Permanent_Marker'] text-[#3E2723] mb-4">
              {activePost?.title}
            </h1>
            {activePost?.render()}
          </motion.article>

          {/* Bottom CTA (consistent across all posts) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center bg-white border-4 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
              Ready to Transform Your Tables?
            </h2>
            <p className="text-[#3E2723]/70 mt-2 max-w-md mx-auto">
              Join hundreds of cafe owners already using {BRAND_NAME} to take orders digitally.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/admin"
                className="px-8 py-3 bg-[#8A9A5B] text-white font-bold border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] hover:shadow-none transition-all"
              >
                <Send size={18} className="inline mr-2" /> Get Started Now
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="px-8 py-3 bg-white text-[#3E2723] font-bold border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#EAE0C8] hover:shadow-none transition-all"
              >
                <Mail size={18} className="inline mr-2" /> Contact Sales
              </a>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-[#3E2723] py-6 px-4 mt-8 relative">
        <div className="max-w-7xl mx-auto text-center text-sm text-[#3E2723]/60">
          <p>
            © {new Date().getFullYear()} {BRAND_NAME}. Built for cafe owners, by cafe lovers.
          </p>
          <p className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/" className="hover:text-[#8A9A5B] transition">Home</Link>
            <a href="/blog#howCreateAccount" className="hover:text-[#8A9A5B] transition">How to Create Account</a>
            <Link to="/admin" className="hover:text-[#8A9A5B] transition">Login</Link>
          </p>
        </div>
        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#8A9A5B] text-white border-2 border-[#3E2723] shadow-[4px_4px_0px_0px_#3E2723] hover:shadow-none transition-all hover:bg-[#78884d]"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      </footer>
    </div>
  );
};

export default Blog;