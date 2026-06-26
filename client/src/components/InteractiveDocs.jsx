// src/components/InteractiveDocs.jsx - Dark, 3D-timeline, immersive walkthrough with dynamic theming
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Check, Settings, QrCode, MessageCircle, Sparkles, ArrowRight, Zap, Clock } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Admin Setup',
    description: 'Create your digital menu in minutes. Add items, set prices, upload images, and configure cafe settings—all in one intuitive dashboard.',
    icon: Settings,
    benefits: ['Bulk menu upload', 'Real-time price updates', 'Custom categories'],
    mockup: (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-xs text-white/40 ml-2">Menu Editor</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
            <span className="text-lg">🍔</span>
            <span className="flex-1 text-sm font-medium text-white/80">Zinger Burger</span>
            <span className="text-sm text-primary font-bold">Rs.550</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
            <span className="text-lg">🥤</span>
            <span className="flex-1 text-sm font-medium text-white/80">Iced Tea</span>
            <span className="text-sm text-primary font-bold">Rs.200</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/30">
            <span className="text-lg">➕</span>
            <span className="flex-1 text-sm font-medium text-primary">Add New Item</span>
            <span className="text-xs text-white/40">Upload image</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'QR Placement',
    description: 'Generate a unique QR code for your cafe menu. Print it, place it on tables, walls, or counters—instant access for customers with a single scan.',
    icon: QrCode,
    benefits: ['High-resolution download', 'Customizable design', 'Multiple table codes'],
    mockup: (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-sm flex flex-col items-center">
        <div className="w-32 h-32 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center shadow-sm">
          <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-2 h-2 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2">Scan to order</p>
        <div className="flex gap-2 mt-2">
          <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-medium border border-primary/30">Download PNG</span>
          <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-medium border border-primary/30">Print Ready</span>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Instant Ordering',
    description: 'Customers scan, browse, and order. The order is sent directly to your WhatsApp—no apps, no commissions, just pure sales.',
    icon: MessageCircle,
    benefits: ['No app download', 'Zero commission', 'Real-time notifications'],
    mockup: (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">W</div>
          <span className="text-sm font-medium text-white/80">WhatsApp Order</span>
          <span className="text-[10px] text-white/30 ml-auto">Just now</span>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
          <p className="text-sm text-white/80"><span className="font-medium text-primary">New Order</span> - Table 3</p>
          <div className="mt-1 space-y-0.5 text-xs text-white/60">
            <p>🍔 2x Zinger Burger - Rs.550</p>
            <p>🥤 1x Iced Tea - Rs.200</p>
            <p className="font-medium text-primary">Total: Rs.1,300</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-medium border border-green-500/30">✅ Confirm</span>
          <span className="px-2 py-1 bg-white/10 text-white/60 rounded-full text-[10px] font-medium border border-white/10">⏳ Prep</span>
        </div>
      </div>
    )
  }
];

// Individual step component with 3D tilt on hover
const StepButton = ({ step, index, isActive, isCompleted, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: 4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative w-full text-left p-4 rounded-2xl transition-all duration-500 group`}
      style={{
        backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: isActive ? '1px solid var(--primary-color)' : '1px solid transparent',
        boxShadow: isActive ? '0 8px 30px rgba(0,0,0,0.3)' : 'none',
        backdropFilter: isActive ? 'blur(12px)' : 'none',
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500`}
            style={{
              background: isActive 
                ? 'linear-gradient(to right, var(--primary-color), var(--secondary-color))' 
                : isCompleted 
                ? 'rgba(var(--primary-color), 0.3)' 
                : 'rgba(255,255,255,0.1)',
              color: isActive ? '#ffffff' : isCompleted ? 'var(--primary-color)' : 'rgba(255,255,255,0.3)',
              border: isCompleted ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {isCompleted ? <Check size={18} /> : index + 1}
          </div>
          {isActive && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: 'var(--primary-color)' }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div 
            className={`text-sm font-medium transition-colors duration-300`}
            style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)' }}
          >
            {step.title}
          </div>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs mt-1 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {step.description.substring(0, 60)}...
            </motion.div>
          )}
        </div>

        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(var(--primary-color), 0.2)', border: '1px solid var(--primary-color)' }}
          >
            <ArrowRight size={16} style={{ color: 'var(--primary-color)' }} />
          </motion.div>
        )}
      </div>

      {isActive && (
        <motion.div
          layoutId="activeStepBar"
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
          style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

const InteractiveDocs = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  return (
    <section ref={containerRef} className="relative py-20 md:py-32 px-4 overflow-hidden" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Background orbs – unified primary */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-96 h-96 rounded-full blur-3xl top-20 right-20"
          style={{ backgroundColor: 'rgba(var(--primary-color), 0.1)' }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-80 h-80 rounded-full blur-3xl bottom-20 left-20"
          style={{ backgroundColor: 'rgba(var(--primary-color), 0.06)' }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(var(--primary-color), 0.06), transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Timeline Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-primary text-sm font-medium mb-3 backdrop-blur-sm shadow-[0_0_30px_rgba(212,168,67,0.15)]" style={{ backgroundColor: 'rgba(var(--primary-color), 0.2)', border: '1px solid rgba(var(--primary-color), 0.3)' }}>
              <Sparkles size={14} />
              <span>Process</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              How It <br />
              <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-white/40 text-sm mt-2">Three simple steps to go digital. No coding, no hassle.</p>
          </div>

          <div className="relative space-y-4">
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

            {steps.map((step, index) => (
              <StepButton
                key={step.id}
                step={step}
                index={index}
                isActive={activeStep === index}
                isCompleted={index < activeStep}
                onClick={() => setActiveStep(index)}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
            <Clock size={14} />
            <span>Average setup: 10 minutes</span>
          </div>
        </div>

        {/* Right: Content Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, rotateX: -5 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/30"
              style={{ perspective: '1000px' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_40px_rgba(212,168,67,0.15)] border border-primary/20"
                  style={{ background: 'linear-gradient(to bottom right, rgba(var(--primary-color), 0.3), rgba(var(--primary-color), 0.05))' }}
                >
                  {React.createElement(steps[activeStep].icon, { size: 32, style: { color: 'var(--primary-color)' } })}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{steps[activeStep].title}</h3>
                  <p className="text-white/60 text-sm mt-1">{steps[activeStep].description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {steps[activeStep].benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm group hover:border-primary/30 transition-colors"
                  >
                    <Check size={14} className="flex-shrink-0 group-hover:scale-110 transition-transform" style={{ color: 'var(--primary-color)' }} />
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ rotateX: 2, rotateY: 4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-sm"
              >
                {steps[activeStep].mockup}
              </motion.div>

              <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
                <Zap size={14} style={{ color: 'var(--primary-color)' }} />
                <span>Click a step above to explore</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDocs;