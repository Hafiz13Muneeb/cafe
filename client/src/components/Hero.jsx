import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Smartphone } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../store/slices/themeSlice';

const Hero = () => {
  const containerRef = useRef(null);
  const theme = useSelector(selectTheme);
  const navigate = useNavigate();

  const phoneItems = useMemo(() => [
    { name: 'Zinger Burger', price: 'Rs.550' },
    { name: 'Iced Tea', price: 'Rs.200' },
    { name: 'French Fries', price: 'Rs.300' },
  ], []);

  const handleDemoClick = () => {
    navigate('/admin');
  };

  const handleBlogClick = () => {
    navigate('/blog');
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-4 py-16 sm:py-20 transition-colors duration-500"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontFamily: "'Shadows Into Light', cursive",
      }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        
        {/* Text Content */}
        <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
          <span className="inline-block px-3 sm:px-4 py-1 border-2 border-dashed border-green-800 rounded-lg rotate-[-2deg] font-bold text-sm sm:text-base">
            ⚡ Fast & Optimized
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Transform Tables<br/>
            <span style={{ color: 'var(--primary-color)' }}>Into Cashflow</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl max-w-lg mx-auto lg:mx-0 opacity-80" style={{ color: 'var(--text-secondary)' }}>
            Ditch the boring AI looks. Real, hand-crafted digital menus for your cafe. 
            No commissions, just pure profit.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button 
              onClick={handleDemoClick}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#3E2723] text-white rounded-none shadow-[8px_8px_0px_0px_var(--primary-color)] hover:shadow-none transition-all text-sm sm:text-base"
            >
              See Demo
            </button>
            <button 
              onClick={handleBlogClick}
              className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-[#3E2723] rounded-none shadow-[8px_8px_0px_0px_var(--primary-color)] hover:shadow-none transition-all text-sm sm:text-base font-bold"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
              }}
            >
              Read Blog
            </button>
          </div>
        </div>

        {/* 2D/3D Artistic Phone Card */}
        <motion.div 
          className="relative w-64 sm:w-72 md:w-80 h-[380px] sm:h-[420px] md:h-[450px] mx-auto p-4 sm:p-6 border-4 border-[#3E2723]"
          style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: '12px 12px 0px 0px var(--primary-color)',
          }}
          whileHover={{ rotate: 2 }}
        >
          <div className="border-b-2 border-black pb-3 sm:pb-4 mb-3 sm:mb-4 font-bold text-lg sm:text-xl" style={{ color: 'var(--text-color)' }}>
            My Cafe Menu
          </div>
          <div className="space-y-3 sm:space-y-4">
            {phoneItems.map((item, i) => (
              <div key={i} className="flex justify-between border-b border-dashed border-gray-400 pb-2 text-sm sm:text-base" style={{ color: 'var(--text-color)' }}>
                <span>{item.name}</span>
                <span className="font-bold">{item.price}</span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 py-2.5 sm:py-3 text-white text-center font-bold text-sm sm:text-base"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            Order Now
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;