import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqData = [
  {
    question: "How does the WhatsApp routing work?",
    answer: "When a customer orders, we send a pre-formatted WhatsApp message directly to your number. No middleware, no delays, no commissions."
  },
  {
    question: "Is there any monthly fee?",
    answer: "No! This is a one-time setup solution. You pay nothing monthly—your profits stay entirely yours."
  },
  {
    question: "Can we update prices during rush hours?",
    answer: "Absolutely. Changes in your admin dashboard reflect immediately on the customer menu. No app updates required."
  },
  {
    question: "Do customers need an app?",
    answer: "No app needed. It's a web-based experience. Customers scan the QR, browse, and order instantly in their browser."
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div
    className="border-4 border-[#3E2723] mb-4 transition-all"
    style={{
      backgroundColor: 'var(--card-bg)',
      boxShadow: isOpen ? "4px 4px 0px 0px var(--primary-color)" : "none",
    }}
  >
    <button
      onClick={onClick}
      className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left font-bold text-sm sm:text-base"
      style={{ color: 'var(--text-color)' }}
    >
      <span className="text-sm sm:text-base md:text-lg">{question}</span>
      <ChevronDown
        className={`transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
        size={20}
        style={{ color: 'var(--text-color)' }}
      />
    </button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="overflow-hidden border-t-2 border-[#3E2723]"
        >
          <p
            className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-color)',
            }}
          >
            {answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      className="py-16 sm:py-20 md:py-24 px-4"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-center"
          style={{
            fontFamily: "'Permanent Marker', cursive",
            color: 'var(--text-color)',
          }}
        >
          Common Questions
        </h2>

        <div className="space-y-2">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              {...faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;