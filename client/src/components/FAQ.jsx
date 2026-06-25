// src/components/FAQ.jsx - Dark, minimal, elegant accordion with neon glow
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Zap } from 'lucide-react';

const faqData = [
  {
    question: "How does the WhatsApp routing work?",
    answer: "When a customer places an order, our system generates a pre-formatted WhatsApp message containing all order details—items, quantities, total price, and table number. The message goes directly to the cafe's registered WhatsApp number. No middleware, no delays, and no commission. It's instant and private."
  },
  {
    question: "Is there any monthly fee for the owner?",
    answer: "No! This is a one-time setup solution with zero recurring fees. You pay nothing monthly—just what you pay for your hosting and domain (if you choose to self-host). We don't take a percentage of your sales. Your profits stay yours."
  },
  {
    question: "Can we update prices instantly during live rush hours?",
    answer: "Absolutely. Any change you make in the admin dashboard reflects immediately on the customer menu—no app updates, no delays. Update prices, mark items as sold out, or change descriptions in real-time. Your customers see the changes the moment you save them."
  },
  {
    question: "Do customers need to download an app?",
    answer: "Not at all. The entire experience is web-based. Customers scan the QR code, open the link in their browser, browse the menu, add items to cart, and order directly via WhatsApp. No installation, no sign-up, no friction. Just a seamless ordering flow."
  },
];

const FAQItem = ({ question, answer, isOpen, onClick, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
      isOpen
        ? 'bg-white/10 backdrop-blur-md border-primary/40 shadow-lg shadow-primary/10'
        : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 hover:bg-white/8'
    }`}
  >
    <button
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between text-left group"
    >
      <div className="flex items-center gap-4">
        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-r from-primary to-amber-500 text-white shadow-[0_0_30px_rgba(212,168,67,0.3)]'
            : 'bg-white/10 text-white/40 group-hover:bg-primary/20 group-hover:text-primary'
        }`}>
          <HelpCircle size={16} />
          {isOpen && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-primary"
            />
          )}
        </div>
        <span className={`font-semibold text-sm md:text-base transition-colors duration-300 ${
          isOpen ? 'text-white' : 'text-white/60 group-hover:text-white/80'
        }`}>
          {question}
        </span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'bg-white/10 text-white/30 group-hover:bg-primary/10 group-hover:text-primary'
        }`}
      >
        <ChevronDown size={18} />
      </motion.div>
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="px-6 pb-5 pt-1 text-sm text-white/60 leading-relaxed border-t border-white/10">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Decorative corner glow for active item */}
    {isOpen && (
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
    )}
  </motion.div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-[#0a0a0f]">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-80 h-80 rounded-full bg-primary/10 blur-3xl top-10 right-10"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl bottom-10 left-10"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.05),transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-4 backdrop-blur-sm shadow-[0_0_30px_rgba(212,168,67,0.15)]">
            <Zap size={14} />
            <span>Support</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Frequently Asked <br />
            <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            Everything you need to know about our contactless menu solution.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              index={index}
              {...faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-white/30">
          Can't find your answer? <a href="/admin" className="text-primary hover:text-primary/80 hover:underline transition-colors">Contact support</a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;