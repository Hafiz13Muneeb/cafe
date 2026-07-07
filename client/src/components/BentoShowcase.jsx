import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Share2, Zap, RefreshCw, QrCode, DollarSign, Sparkles } from 'lucide-react';

const BentoCard = ({ icon: Icon, title, description, className }) => {
  return (
    <motion.div
      whileHover={{ y: -5, x: -2 }}
      className={`p-4 sm:p-6 border-4 border-[#3E2723] transition-all ${className}`}
      style={{
        backgroundColor: 'var(--card-bg)',
        boxShadow: '8px 8px 0px 0px var(--primary-color)',
      }}
    >
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 flex items-center justify-center border-2 border-[#3E2723]"
        style={{ backgroundColor: 'var(--secondary-color)' }}
      >
        <Icon size={20} className="sm:w-6 sm:h-6" style={{ color: 'var(--text-color)' }} />
      </div>
      <h3
        className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2"
        style={{
          fontFamily: "'Permanent Marker', cursive",
          color: 'var(--text-color)',
        }}
      >
        {title}
      </h3>
      <p className="text-sm sm:text-base leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </motion.div>
  );
};

const BentoShowcase = () => {
  const cards = [
    { icon: RefreshCw, title: "Real-time Sync", description: "Update prices instantly. Changes hit your cafe menu in seconds.", className: "col-span-1 md:col-span-2" },
    { icon: DollarSign, title: "Zero-Commission", description: "Keep 100% of your earnings. No hidden cuts, ever.", className: "col-span-1" },
    { icon: QrCode, title: "Fast QR", description: "Premium QR codes generated in a snap. Works everywhere.", className: "col-span-1" },
    { icon: Smartphone, title: "Mobile Optimized", description: "Looks perfect on every phone. Just tap and order.", className: "col-span-1" },
    { icon: Share2, title: "Viral Sharing", description: "Let customers do the marketing. Sharing made easy.", className: "col-span-1 md:col-span-1" },
  ];

  return (
    <section className="py-16 sm:py-24 px-4" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4"
            style={{
              fontFamily: "'Permanent Marker', cursive",
              color: 'var(--text-color)',
            }}
          >
            Cafe Toolkit
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Built for speed, styled for soul.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, index) => (
            <BentoCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoShowcase;