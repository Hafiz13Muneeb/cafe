// src/components/Hero.jsx - Simplified for single-cafe (removed SaaS marketing)
import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Hero = () => {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const colors = {
    bg: theme === 'dark' ? '#2c2621' : '#F5F5DC',
    text: theme === 'dark' ? '#EAE0C8' : '#3E2723',
    accent: '#8A9A5B',
  };

  const phoneItems = useMemo(() => [
    { name: 'Zinger Burger', price: 'Rs.550' },
    { name: 'Iced Tea', price: 'Rs.200' },
    { name: 'French Fries', price: 'Rs.300' },
  ], []);

  const handleLoginClick = () => {
    navigate('/admin');
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-4 py-16 sm:py-20 transition-colors duration-500"
      style={{ backgroundColor: colors.bg, color: colors.text, fontFamily: "'Shadows Into Light', cursive" }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        
        {/* Text Content */}
        <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
          <span className="inline-block px-3 sm:px-4 py-1 border-2 border-dashed border-[#8A9A5B] rounded-lg rotate-[-2deg] font-bold text-sm sm:text-base">
            ☕ Your Digital Menu
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Welcome to<br/>
            <span style={{ color: colors.accent }}>Your Cafe Dashboard</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl max-w-lg mx-auto lg:mx-0 opacity-80">
            Manage your menu, track orders, and keep your customers happy – all from one place.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button 
              onClick={handleLoginClick}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#3E2723] text-white rounded-none shadow-[8px_8px_0px_0px_#8A9A5B] hover:shadow-none transition-all text-sm sm:text-base font-bold"
            >
              Login to Dashboard →
            </button>
          </div>
        </div>

        {/* 2D/3D Artistic Phone Card */}
        <motion.div 
          className="relative w-64 sm:w-72 md:w-80 h-[380px] sm:h-[420px] md:h-[450px] mx-auto bg-white p-4 sm:p-6 border-4 border-[#3E2723] shadow-[12px_12px_0px_0px_#8A9A5B]"
          whileHover={{ rotate: 2 }}
        >
          <div className="border-b-2 border-black pb-3 sm:pb-4 mb-3 sm:mb-4 font-bold text-lg sm:text-xl">My Cafe Menu</div>
          <div className="space-y-3 sm:space-y-4">
            {phoneItems.map((item, i) => (
              <div key={i} className="flex justify-between border-b border-dashed border-gray-400 pb-2 text-sm sm:text-base">
                <span>{item.name}</span>
                <span className="font-bold">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 py-2.5 sm:py-3 bg-[#8A9A5B] text-white text-center font-bold text-sm sm:text-base">
            Order Now
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;