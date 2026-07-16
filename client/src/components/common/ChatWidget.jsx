// src/components/common/ChatWidget.jsx - Role-based FAQs with customer email support
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ownerFAQs } from '../../config/ownerFAQs';

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

    // Owner uses .env support email, customer uses owner's email
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
              {loading ? (
                <div className="text-center py-4 text-[#3E2723]/50 text-sm">Loading FAQs...</div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-4 text-[#3E2723]/50 text-sm">No FAQs available.</div>
              ) : (
                faqs.map((faq) => {
                  const id = faq.id || faq._id;
                  return (
                    <div
                      key={id}
                      className="border-2 border-[#3E2723]/20 hover:border-[#8A9A5B] transition overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(id)}
                        className="w-full flex items-center justify-between p-2 text-left text-sm font-bold text-[#3E2723] hover:bg-[#F5F5DC] transition"
                      >
                        <span className="flex-1">{faq.question}</span>
                        {expandedFaq === id ? (
                          <ChevronUp size={16} className="flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown size={16} className="flex-shrink-0 ml-2" />
                        )}
                      </button>
                      {expandedFaq === id && (
                        <div className="p-3 bg-[#FAF9F6] border-t-2 border-[#3E2723]/10 text-sm text-[#3E2723]/80">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
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
        </div>
      )}
    </>
  );
};

export default ChatWidget;