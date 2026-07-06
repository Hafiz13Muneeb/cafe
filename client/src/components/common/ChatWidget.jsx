// src/components/common/ChatWidget.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { MessageCircle, X, ChevronDown, ChevronUp, Send } from 'lucide-react';

// Brand name and support email from .env
const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CafeFlow';
const SUPPORT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@cafeflow.com';

// FAQ Data – easily scalable (add more Q&A pairs here)
const FAQS = [
  {
    id: 1,
    question: 'How do I add a new menu item?',
    answer:
      'Go to your Dashboard, click "Add New" under Menu Items. Fill in the title, price, category, upload an image, and click "Add Item". Your new item will appear on the public menu instantly.',
  },
  {
    id: 2,
    question: 'How can I update my cafe details?',
    answer:
      'Click the Settings icon (gear) in the top‑right corner. In the "Cafe Settings" tab, you can update your cafe name, WhatsApp number, and table numbers.',
  },
  {
    id: 3,
    question: 'How do I change the theme colours?',
    answer:
      'Go to Settings → Appearance. You can pick a preset palette or set custom primary/secondary colours using the colour pickers. Toggle between Light and Dark mode as well.',
  },
  {
    id: 4,
    question: 'How do I generate a QR code for my menu?',
    answer:
      'Your QR code is displayed on the Dashboard. You can download it as a PNG or copy the menu link to share it. Place the QR code on your tables for customers to scan.',
  },
  {
    id: 5,
    question: 'How do I track orders and analytics?',
    answer:
      'On the Dashboard, you\'ll see your QR code and menu items. For detailed analytics (views, orders, revenue), contact your superadmin who has access to the Analytics dashboard.',
  },
];

const ChatWidget = () => {
  const user = useSelector(selectUser);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Don't render if user is superadmin
  if (user?.role === 'superadmin') {
    return null;
  }

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    // Reset expanded FAQ when closing
    if (isOpen) {
      setExpandedFaq(null);
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;

    const subject = encodeURIComponent(`Question from ${BRAND_NAME} User`);
    const body = encodeURIComponent(
      `Hello ${BRAND_NAME} Support Team,\n\nI have a question about the platform:\n\n"${userQuestion.trim()}"\n\nPlease get back to me at your earliest convenience.\n\nThank you!`
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    setShowSuccess(true);
    setUserQuestion('');
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleWidget}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] transition-all hover:shadow-none hover:scale-105 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-[#8A9A5B] hover:bg-[#78884d]'
        } text-white`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[500px] bg-white border-4 border-[#3E2723] shadow-[12px_12px_0px_0px_#8A9A5B] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#8A9A5B] p-3 border-b-4 border-[#3E2723] flex items-center justify-between">
            <span className="font-bold font-['Permanent_Marker'] text-white text-lg">
              {BRAND_NAME} Help
            </span>
            <button
              onClick={toggleWidget}
              className="text-white hover:opacity-70 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Success message */}
            {showSuccess && (
              <div className="bg-[#EAE0C8] border-2 border-[#3E2723] p-2 text-sm font-bold text-[#3E2723] text-center">
                ✅ Message ready! Check your email client.
              </div>
            )}

            {/* FAQ List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#3E2723]/60 uppercase tracking-wider">
                Frequently Asked Questions
              </p>
              {FAQS.map((faq) => (
                <div
                  key={faq.id}
                  className="border-2 border-[#3E2723]/20 hover:border-[#8A9A5B] transition overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-2 text-left text-sm font-bold text-[#3E2723] hover:bg-[#F5F5DC] transition"
                  >
                    <span className="flex-1">{faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp size={16} className="flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown size={16} className="flex-shrink-0 ml-2" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="p-3 bg-[#FAF9F6] border-t-2 border-[#3E2723]/10 text-sm text-[#3E2723]/80">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-[#3E2723]/20 my-2" />

            {/* Ask a custom question */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#3E2723]/60 uppercase tracking-wider">
                Ask a custom question
              </p>
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full p-2 border-2 border-[#3E2723] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8A9A5B] resize-none"
                rows="2"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!userQuestion.trim()}
                className={`w-full py-2 text-sm font-bold border-2 border-[#3E2723] transition flex items-center justify-center gap-2 ${
                  userQuestion.trim()
                    ? 'bg-[#8A9A5B] text-white hover:bg-[#78884d] shadow-[4px_4px_0px_0px_#3E2723] hover:shadow-none'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={14} /> Send to Support
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[#3E2723] bg-[#F5F5DC] p-2 text-center text-[10px] text-[#3E2723]/50">
            Powered by {BRAND_NAME}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;