import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Share2, Zap, RefreshCw, QrCode, DollarSign, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BentoCard = ({ icon: Icon, title, description, className }) => {
  const { theme } = useTheme();
  const shadowStyle = "8px 8px 0px 0px var(--primary-color)";
  
  return (
    <motion.div
      whileHover={{ y: -5, x: -2 }}
      className={`p-4 sm:p-6 border-4 border-[#3E2723] bg-[#FAF9F6] transition-all ${className}`}
      style={{ boxShadow: shadowStyle }}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 flex items-center justify-center border-2 border-[#3E2723] bg-[#EAE0C8]">
        <Icon size={20} className="sm:w-6 sm:h-6 text-[#3E2723]" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-[#3E2723] mb-1 sm:mb-2" style={{ fontFamily: "'Permanent Marker', cursive" }}>
        {title}
      </h3>
      <p className="text-sm sm:text-base text-[#3E2723]/80 leading-relaxed font-medium">
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
    <section className="py-16 sm:py-24 px-4 bg-[#F5F5DC]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#3E2723] mb-3 sm:mb-4" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Cafe Toolkit
          </h2>
          <p className="text-base sm:text-lg text-[#3E2723]/70">Built for speed, styled for soul.</p>
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