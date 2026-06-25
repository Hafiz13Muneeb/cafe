// src/pages/Home.jsx - Premium light-theme landing page
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Hero from '../components/Hero';
import BentoShowcase from '../components/BentoShowcase';
import InteractiveDocs from '../components/InteractiveDocs';
import FAQ from '../components/FAQ';
import CursorGlow from '../components/CursorGlow';

// Skeleton loader for the homepage
const HomeSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    {/* Hero skeleton */}
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.15),transparent_70%)] opacity-30" />
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left content */}
        <div className="space-y-6 text-center lg:text-left">
          {/* Badge skeleton */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light border border-primary/30 rounded-full">
            <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
            <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
          </div>
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-12 bg-slate-200 rounded w-3/4 mx-auto lg:mx-0 animate-pulse" />
            <div className="h-12 bg-slate-200 rounded w-2/3 mx-auto lg:mx-0 animate-pulse" />
          </div>
          {/* Description skeleton */}
          <div className="space-y-2 max-w-lg mx-auto lg:mx-0">
            <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
          </div>
          {/* Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-12 w-32 bg-slate-200 rounded-xl animate-pulse" />
          </div>
          {/* Trust badge skeleton */}
          <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-4 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        {/* Phone mockup skeleton */}
        <div className="flex justify-center items-center">
          <div className="relative w-64 h-[420px] md:w-80 md:h-[500px] mx-auto">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-slate-200 to-slate-300 p-1 shadow-2xl shadow-primary/20">
              <div className="relative w-full h-full rounded-[2.8rem] bg-white overflow-hidden">
                <div className="absolute inset-0 p-4 flex flex-col">
                  <div className="flex justify-between text-xs text-slate-400 px-2 pt-2">
                    <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="mt-4 space-y-3 flex-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-slate-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
                        <div className="flex-1 h-4 bg-slate-200 rounded animate-pulse" />
                        <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-slate-200 rounded-xl p-3 h-10 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  </div>
);

const Home = () => {
  const { theme, loading } = useTheme();

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CursorGlow />
      <Hero />
      <BentoShowcase />
      <InteractiveDocs />
      <FAQ />
    </div>
  );
};

export default Home;