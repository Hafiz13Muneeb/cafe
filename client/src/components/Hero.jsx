import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Ensure this exists

const Hero = () => {
  const containerRef = useRef(null);
  const { theme } = useTheme(); // Theme support

  // Palette: Cream, Muted Green, Tan, Dark Brown
  const colors = {
    bg: theme === 'dark' ? '#2c2621' : '#F5F5DC', // Dark Brown base vs Cream
    text: theme === 'dark' ? '#EAE0C8' : '#3E2723', // Tan vs Dark Brown
    accent: '#8A9A5B', // Muted Green
  };

  const phoneItems = useMemo(() => [
    { name: 'Zinger Burger', price: 'Rs.550' },
    { name: 'Iced Tea', price: 'Rs.200' },
    { name: 'French Fries', price: 'Rs.300' },
  ], []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-4 py-20 transition-colors duration-500"
      style={{ backgroundColor: colors.bg, color: colors.text, fontFamily: "'Shadows Into Light', cursive" }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <div className="space-y-6 text-center lg:text-left">
          <span className="inline-block px-4 py-1 border-2 border-dashed border-green-800 rounded-lg rotate-[-2deg] font-bold">
            ⚡ Fast & Optimized
          </span>
          
          <h1 className="text-5xl lg:text-8xl font-bold" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Transform Tables<br/>
            <span style={{ color: colors.accent }}>Into Cashflow</span>
          </h1>

          <p className="text-xl max-w-lg mx-auto lg:mx-0 opacity-80">
            Ditch the boring AI looks. Real, hand-crafted digital menus for your cafe. 
            No commissions, just pure profit.
          </p>

          <div className="flex gap-4 justify-center lg:justify-start">
            <button className="px-8 py-3 bg-[#3E2723] text-white rounded-none shadow-[8px_8px_0px_0px_rgba(138,154,91,1)] hover:shadow-none transition-all">
              See Demo
            </button>
          </div>
        </div>

        {/* 2D/3D Artistic Phone Card */}
        <motion.div 
          className="relative w-72 h-[450px] mx-auto bg-white p-6 border-4 border-[#3E2723] shadow-[15px_15px_0px_0px_#8A9A5B]"
          whileHover={{ rotate: 2 }}
        >
          <div className="border-b-2 border-black pb-4 mb-4 font-bold text-xl">My Cafe Menu</div>
          <div className="space-y-4">
            {phoneItems.map((item, i) => (
              <div key={i} className="flex justify-between border-b border-dashed border-gray-400 pb-2">
                <span>{item.name}</span>
                <span className="font-bold">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 left-6 right-6 py-3 bg-[#8A9A5B] text-white text-center font-bold">
            Order Now
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;