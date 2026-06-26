// src/pages/Home.jsx - Premium light-theme landing page (SaaS marketing)
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Hero from '../components/Hero';
import BentoShowcase from '../components/BentoShowcase';
import InteractiveDocs from '../components/InteractiveDocs';
import FAQ from '../components/FAQ';
import CursorGlow from '../components/CursorGlow';

// Skeleton loader – now using CSS variables
const HomeSkeleton = () => (
  <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30" />
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary-color)' }}>
            <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="w-24 h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
          <div className="space-y-2">
            <div className="h-12 rounded w-3/4 mx-auto lg:mx-0 animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="h-12 rounded w-2/3 mx-auto lg:mx-0 animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
          <div className="space-y-2 max-w-lg mx-auto lg:mx-0">
            <div className="h-4 rounded w-full animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="h-4 rounded w-5/6 animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <div className="h-12 w-40 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="h-12 w-32 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
          <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
            <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="h-4 w-4 rounded-full animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="h-4 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative w-64 h-[420px] md:w-80 md:h-[500px] mx-auto">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-slate-200 to-slate-300 p-1 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(212,168,67,0.2)' }}>
              <div className="relative w-full h-full rounded-[2.8rem] bg-white overflow-hidden">
                <div className="absolute inset-0 p-4 flex flex-col">
                  <div className="flex justify-between text-xs text-slate-400 px-2 pt-2">
                    <div className="h-3 w-8 rounded animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
                    <div className="h-3 w-8 rounded animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
                  </div>
                  <div className="mt-4 space-y-3 flex-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--bg-color)' }}>
                        <div className="w-6 h-6 rounded-full animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
                        <div className="flex-1 h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
                        <div className="w-6 h-6 rounded animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto rounded-xl p-3 h-10 animate-pulse" style={{ backgroundColor: 'var(--border-color)' }} />
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 rounded-full -z-10" style={{ backgroundColor: 'rgba(212,168,67,0.1)', filter: 'blur(40px)' }} />
          </div>
        </div>
      </div>
    </section>
  </div>
);

const Home = () => {
  const { loading } = useTheme();

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <CursorGlow />
      <Hero />
      <BentoShowcase />
      <InteractiveDocs />
      <FAQ />
    </div>
  );
};

export default Home;