import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  <div className="border-4 border-[#3E2723] mb-4 bg-white transition-all" 
       style={{ boxShadow: isOpen ? "6px 6px 0px 0px #8A9A5B" : "none" }}>
    <button
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-[#3E2723]"
    >
      <span className="text-lg">{question}</span>
      <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="overflow-hidden border-t-2 border-[#3E2723]"
        >
          <p className="px-6 py-4 text-[#3E2723]/80 bg-[#FAF9F6]">
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
    <section className="py-24 px-4 bg-[#F5F5DC]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl font-bold text-[#3E2723] mb-12 text-center" style={{ fontFamily: "'Permanent Marker', cursive" }}>
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