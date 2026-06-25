// src/components/BentoShowcase.jsx - Dark, 3D-tilt, asymmetrical feature grid
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Share2, Zap, RefreshCw, QrCode, DollarSign, Sparkles } from 'lucide-react';

// 3D tilt card component
const BentoCard = ({ icon: Icon, title, description, className, delay = 0, glowColor = 'primary' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  // Map glow color to gradient
  const glowMap = {
    primary: 'from-primary/30 via-primary/10 to-transparent',
    blue: 'from-blue-500/30 via-blue-500/10 to-transparent',
    purple: 'from-purple-500/30 via-purple-500/10 to-transparent',
    emerald: 'from-emerald-500/30 via-emerald-500/10 to-transparent',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{
        rotateX: -4,
        rotateY: 6,
        scale: 1.02,
        transition: { duration: 0.4, ease: 'easeOut' },
      }}
      className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-lg shadow-black/20 hover:shadow-primary/20 transition-shadow duration-500 group ${className}`}
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${glowMap[glowColor] || glowMap.primary} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl`} />

      {/* Icon with neon glow ring */}
      <div className="relative w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(212,168,67,0)] group-hover:shadow-[0_0_40px_rgba(212,168,67,0.3)]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        <Icon size={26} className="text-primary relative z-10" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
        {description}
      </p>

      {/* Corner glow */}
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/30 transition-all duration-700 pointer-events-none" />
    </motion.div>
  );
};

const BentoShowcase = () => {
  const cards = [
    {
      icon: RefreshCw,
      title: "Real-time Menu Sync",
      description: "Update prices, stock, and item descriptions instantly. Changes reflect immediately on all customer devices—no app update required.",
      className: "col-span-1 md:col-span-2 row-span-1",
      delay: 0,
      glowColor: 'primary',
    },
    {
      icon: DollarSign,
      title: "Zero-Commission Checkout",
      description: "Every rupee goes directly to you. No hidden fees, no percentage cuts—just pure WhatsApp-based ordering.",
      className: "col-span-1 row-span-1",
      delay: 0.1,
      glowColor: 'emerald',
    },
    {
      icon: QrCode,
      title: "Lightning Fast QR Scanning",
      description: "Generate and download premium QR codes in seconds. Optimized scanning works even in low light.",
      className: "col-span-1 row-span-1",
      delay: 0.15,
      glowColor: 'blue',
    },
    {
      icon: Smartphone,
      title: "Mobile-First Experience",
      description: "Designed for the palm of your hand. Every tap, swipe, and scroll is buttery smooth and instantly responsive.",
      className: "col-span-1 row-span-1",
      delay: 0.2,
      glowColor: 'purple',
    },
    {
      icon: Share2,
      title: "Viral Sharing",
      description: "Customers can share your menu via WhatsApp, Instagram, or SMS—turning every order into free marketing.",
      className: "col-span-1 md:col-span-2 row-span-1",
      delay: 0.25,
      glowColor: 'primary',
    },
  ];

  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-[#0a0a0f]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl top-10 right-20"
        />
        <motion.div
          animate={{ x: [0, -70, 0], y: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl bottom-10 left-20"
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-64 h-64 rounded-full bg-amber-500/5 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.08),transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-4 backdrop-blur-sm shadow-[0_0_30px_rgba(212,168,67,0.15)]">
            <Sparkles size={14} />
            <span>Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Everything you need to <br />
            <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
              scale your cafe
            </span>
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg">
            From menu management to instant ordering—your digital storefront, fully powered.
          </p>
        </motion.div>

        {/* Bento Grid with asymmetry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 auto-rows-[220px]">
          {cards.map((card, index) => (
            <BentoCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoShowcase;