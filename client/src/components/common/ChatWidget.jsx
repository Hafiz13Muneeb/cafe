// src/components/common/ChatWidget.jsx - Role-based FAQs with customer email support
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';   // ✅ fixed path
import api from '../../api/axios';                      // ✅ fixed path
import { ownerFAQs } from '../../config/ownerFAQs';     // ✅ fixed path

const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'CafeFlow';
const SUPPORT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@cafeflow.com';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');

  const isOwner = !!user;
  const displayName = user?.cafeName || BRAND_NAME;

  // Fetch support email from global settings (for customers)
  useEffect(() => {
    const fetchSupportEmail = async () => {
      try {
        const res = await api.get('/settings/global');
        if (res.data.success && res.data.data.supportEmail) {
          setSupportEmail(res.data.data.supportEmail);
        }
      } catch (err) {
        console.error('Failed to fetch support email:', err);
      }
    };
    if (!isOwner) {
      fetchSupportEmail();
    }
  }, [isOwner]);

  // Load FAQs based on role
  useEffect(() => {
    if (isOwner) {
      setFaqs(ownerFAQs);
      setLoading(false);
    } else {
      const fetchFAQs = async () => {
        try {
          setLoading(true);
          const res = await api.get('/faqs');
          if (res.data.success) {
            setFaqs(res.data.data);
          } else {
            setFaqs([]);
          }
        } catch (err) {
          console.error('Failed to fetch FAQs:', err);
          setFaqs([]);
        } finally {
          setLoading(false);
        }
      };
      fetchFAQs();
    }
  }, [isOwner]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (isOpen) setExpandedFaq(null);
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;

    const targetEmail = isOwner ? SUPPORT_EMAIL : (supportEmail || SUPPORT_EMAIL);
    const subject = encodeURIComponent(`Question from ${displayName}`);
    const body = encodeURIComponent(
      `Hello Support Team,\n\nI have a question about my cafe dashboard:\n\n"${userQuestion.trim()}"\n\nPlease get back to me at your earliest convenience.\n\nThank you!`
    );

    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    setShowSuccess(true);
    setUserQuestion('');
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleWidget}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full border-2 border-[var(--border-color)] shadow-[6px_6px_0px_0px_var(--border-color)] transition-all hover:shadow-none hover:scale-105 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:opacity-80'
        } text-white`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[500px] bg-[var(--card-bg)] border-4 border-[var(--border-color)] shadow-[12px_12px_0px_0px_var(--border-color)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-3 border-b-4 border-[var(--border-color)] flex items-center justify-between">
            <span className="font-bold font-['Permanent_Marker'] text-white text-lg">
              {displayName} Help
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-color)]">
            {showSuccess && (
              <div className="bg-[var(--bg-color)] border-2 border-[var(--border-color)] p-2 text-sm font-bold text-[var(--text-color)] text-center">
                ✅ Message ready! Check your email client.
              </div>
            )}

            {/* FAQ List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--text-color)]/60 uppercase tracking-wider">
                Frequently Asked Questions
              </p>
              {loading ? (
                <div className="text-center py-4 text-[var(--text-color)]/50 text-sm">Loading FAQs...</div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-4 text-[var(--text-color)]/50 text-sm">No FAQs available.</div>
              ) : (
                faqs.map((faq) => {
                  const id = faq.id || faq._id;
                  return (
                    <div
                      key={id}
                      className="border-2 border-[var(--border-color)]/20 hover:border-primary transition overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(id)}
                        className="w-full flex items-center justify-between p-2 text-left text-sm font-bold text-[var(--text-color)] hover:bg-[var(--bg-color)] transition"
                      >
                        <span className="flex-1">{faq.question}</span>
                        {expandedFaq === id ? (
                          <ChevronUp size={16} className="flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown size={16} className="flex-shrink-0 ml-2" />
                        )}
                      </button>
                      {expandedFaq === id && (
                        <div className="p-3 bg-[var(--bg-color)] border-t-2 border-[var(--border-color)]/10 text-sm text-[var(--text-color)]/80">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-[var(--border-color)]/20 my-2" />

            {/* Ask a custom question */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--text-color)]/60 uppercase tracking-wider">
                Ask a custom question
              </p>
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full p-2 border-2 border-[var(--border-color)] text-sm bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows="2"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!userQuestion.trim()}
                className={`w-full py-2 text-sm font-bold border-2 border-[var(--border-color)] transition flex items-center justify-center gap-2 ${
                  userQuestion.trim()
                    ? 'bg-primary text-white hover:opacity-80 shadow-[4px_4px_0px_0px_var(--border-color)] hover:shadow-none'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={14} /> Send to Support
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;