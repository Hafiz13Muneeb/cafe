// src/components/Hero.jsx - Dark, cinematic, 3D-heavy hero with scroll-driven animations
import React, { useRef, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Smartphone, Move } from 'lucide-react';

// Particle canvas component
const Particles = ({ count = 80 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />;
};

// Floating 3D shape component
const FloatingShape = ({ delay, duration, size, className, style, rotation, children }) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{ y: [0, -40, 0], rotate: rotation ? [0, 360, 0] : 0 }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    className={`absolute ${className}`}
    style={{ width: size, height: size, ...style }}
  >
    {children}
  </motion.div>
);

// Grid background (SVG pattern)
const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none opacity-20">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, -45]);

  // Pre-define phone items
  const phoneItems = useMemo(
    () => [
      { icon: '🍔', name: 'Zinger Burger', price: 'Rs.550' },
      { icon: '🥤', name: 'Iced Tea', price: 'Rs.200' },
      { icon: '🍟', name: 'French Fries', price: 'Rs.300' },
    ],
    []
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: '#0a0a0f', color: '#ffffff' }}
    >
      {/* Background: grid + glows – unified primary */}
      <GridBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slower" />

      {/* Particles */}
      <Particles count={100} />

      {/* Floating 3D shapes – unified primary */}
      <FloatingShape delay={0} duration={8} size="100px" className="top-20 left-[10%] rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-2xl" rotation />
      <FloatingShape delay={2} duration={10} size="120px" className="bottom-20 right-[10%] rounded-full bg-primary/20 blur-3xl" rotation />
      <FloatingShape delay={4} duration={12} size="60px" className="top-1/2 left-[5%] bg-primary/20 rounded-lg rotate-45" rotation />

      {/* Content */}
      <motion.div
        style={{ y: y1 }}
        className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
      >
        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6 text-center lg:text-left"
        >
          {/* Badge with glow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-primary/30 rounded-full text-primary text-sm font-medium shadow-[0_0_30px_rgba(212,168,67,0.15)]">
            <Sparkles size={16} />
            <span>AI-Powered Ordering</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
            <span className="text-white">Transform Tables</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
              Into Digital Cashflows
            </span>
          </h1>

          <p className="text-lg text-white/70 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            The zero-commission, contactless menu that turns every scan into a sale.
            Simple QR setup, instant WhatsApp ordering.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <motion.a
              href="/menu/demo"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px var(--primary-light)' }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-amber-500 text-white rounded-2xl font-semibold shadow-lg shadow-primary/30 transition-all duration-300"
              style={{ '--primary-light': 'rgba(212, 168, 67, 0.3)' }}
            >
              See Live Demo
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </motion.a>
            <motion.a
              href="/admin"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all duration-300"
            >
              Admin Login
            </motion.a>
          </div>

          <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-white/50 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              500+ cafes use us
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1">⭐ 4.9/5 rating</span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1">
              <Zap size={14} className="text-primary" />
              Zero commission
            </span>
          </div>
        </motion.div>

        {/* Right: 3D Phone with scroll rotation */}
        <motion.div
          style={{ y: y2, scale, rotateY }}
          className="flex justify-center items-center perspective-1000"
        >
          <div className="relative w-64 h-[420px] md:w-80 md:h-[500px] mx-auto">
            {/* Glow behind phone – unified primary */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full"
            />

            {/* Phone Body */}
            <div className="relative w-full h-full transform-style-3d" style={{ transform: 'rotateY(-8deg) rotateX(3deg)' }}>
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 p-[3px] shadow-2xl shadow-primary/20">
                <div className="relative w-full h-full rounded-[2.8rem] bg-[#111118] backdrop-blur-sm overflow-hidden border border-white/5">
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 pt-3 text-xs text-white/50 font-medium">
                    <span>9:41</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                      <span>📶</span>
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="absolute inset-0 p-5 pt-10 flex flex-col">
                    <div className="mt-2 space-y-3 flex-1">
                      {phoneItems.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 border border-white/5 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="flex-1 text-sm font-medium text-white/80">{item.name}</span>
                          <span className="text-primary font-bold text-sm">{item.price}</span>
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">+</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Cart Button */}
                    <div className="mt-auto pt-2">
                      <div className="bg-gradient-to-r from-primary to-amber-500 rounded-2xl p-3 text-center text-sm font-bold text-white shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                        <Smartphone size={16} />
                        View Cart (3 items)
                      </div>
                    </div>
                  </div>

                  {/* Bottom Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;