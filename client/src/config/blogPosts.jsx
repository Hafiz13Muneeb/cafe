// src/config/blogPosts.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  Users,
  Zap,
  Mail,
  Send,
  CheckCircle,
  Shield,
  Palette,
  BarChart3,
  Settings,
  Smartphone,
  DollarSign,
} from 'lucide-react';

// Environment variables (fallback values)
const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CafeFlow';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@cafeflow.com';

export const BLOG_POSTS = [
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
              style={{ borderColor: 'var(--border-color)' }}
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