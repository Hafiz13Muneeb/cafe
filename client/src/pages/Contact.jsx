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
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b-4 border-[#3E2723] shadow-[0_4px_0_0_#8A9A5B] py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coffee size={28} className="text-[#8A9A5B]" />
            <span className="text-2xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
              {BRAND_NAME}
            </span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold text-[#3E2723] hover:text-[#8A9A5B] transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white border-4 border-[#3E2723] shadow-[12px_12px_0px_0px_#8A9A5B] p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-['Permanent_Marker'] text-[#3E2723] mb-2">
            Contact Us
          </h1>
          <p className="text-[#3E2723]/70 mb-6">
            Have a question or need help? Fill out the form below and we'll get back to you via email.
          </p>

          {sent && (
            <div className="mb-4 p-3 border-2 border-[#3E2723] bg-[#8A9A5B] text-white font-bold flex items-center gap-2">
              <CheckCircle size={20} /> Message ready! Check your email client to send it.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="name">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#3E2723] bg-white focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="email">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#3E2723] bg-white focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="subject">
                Subject (optional)
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#3E2723] bg-white focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="message">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                className="w-full px-3 py-2 border-2 border-[#3E2723] bg-white focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] resize-none"
                placeholder="Write your question or message here..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-[#8A9A5B] text-white font-bold border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> Send Message
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-[#3E2723]/20">
            <p className="text-sm text-[#3E2723]/60 text-center">
              Or reach us directly at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#8A9A5B] hover:underline font-medium">
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