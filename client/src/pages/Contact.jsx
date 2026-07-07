// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle, Coffee, ArrowLeft } from 'lucide-react';

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CafeFlow';
const SUPPORT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@cafeflow.com';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const mailSubject = encodeURIComponent(subject || `Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div
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
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold transition"
            style={{ color: 'var(--text-color)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-color)'}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div
          className="border-4 border-[#3E2723] p-6 sm:p-10"
          style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: '12px 12px 0px 0px var(--primary-color)',
          }}
        >
          <h1
            className="text-3xl sm:text-4xl font-bold font-['Permanent_Marker'] mb-2"
            style={{ color: 'var(--text-color)' }}
          >
            Contact Us
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Have a question or need help? Fill out the form below and we'll get back to you via email.
          </p>

          {sent && (
            <div
              className="mb-4 p-3 border-2 border-[#3E2723] text-white font-bold flex items-center gap-2"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <CheckCircle size={20} /> Message ready! Check your email client to send it.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }} htmlFor="name">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#3E2723] focus:outline-none transition"
                placeholder="John Doe"
                required
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px var(--primary-color)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }} htmlFor="email">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#3E2723] focus:outline-none transition"
                placeholder="you@example.com"
                required
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px var(--primary-color)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }} htmlFor="subject">
                Subject (optional)
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#3E2723] focus:outline-none transition"
                placeholder="What's this about?"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px var(--primary-color)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }} htmlFor="message">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                className="w-full px-3 py-2 border-2 border-[#3E2723] focus:outline-none transition resize-none"
                placeholder="Write your question or message here..."
                required
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px var(--primary-color)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 text-white font-bold border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] hover:shadow-none transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--primary-color)' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary-color)';
              }}
            >
              <Send size={18} /> Send Message
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Or reach us directly at{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="hover:underline font-medium"
                style={{ color: 'var(--primary-color)' }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;