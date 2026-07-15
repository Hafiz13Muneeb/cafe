// src/pages/Home.jsx - Customer-facing landing page
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { homeData } from '../config/homeData';
import CursorGlow from '../components/CursorGlow';

const Home = () => {
  const { loading } = useTheme();

  if (loading) {
    return <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center font-bold text-[#3E2723]">Loading...</div>;
  }

  const { cafe, hero, features, testimonials } = homeData;

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] overflow-x-hidden">
      <CursorGlow />

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-[#EAE0C8] border-b-4 border-[#3E2723]">
        <h1 className="text-4xl sm:text-6xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
          {hero.title || cafe.name}
        </h1>
        <p className="text-lg sm:text-xl mt-4 max-w-2xl mx-auto text-[#3E2723]/80">
          {hero.subtitle || cafe.tagline}
        </p>
        <Link
          to="/menu"
          className="inline-block mt-6 px-8 py-3 bg-[#3E2723] text-white shadow-[8px_8px_0px_0px_#8A9A5B] hover:shadow-none transition-all font-bold text-lg"
        >
          {hero.cta || 'View Our Menu'} →
        </Link>
      </section>

      {/* Cafe Info */}
      <section className="py-8 px-4 bg-white/50 border-b-2 border-[#3E2723]/20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
          <div>
            <p className="text-sm text-[#3E2723]/70">
              <span className="font-bold">📍</span> {cafe.address}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#3E2723]/70">
              <span className="font-bold">📞</span> {cafe.phone}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-[#3E2723]/70">
              <span className="font-bold">🕒</span> {cafe.openingHours}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-white/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white border-2 border-[#3E2723] p-6 shadow-[4px_4px_0px_0px_#8A9A5B] text-center">
              <div className="text-4xl mb-2">{feat.icon}</div>
              <h3 className="text-xl font-bold font-['Permanent_Marker']">{feat.title}</h3>
              <p className="text-sm text-[#3E2723]/70">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4 bg-[#EAE0C8] border-t-2 border-[#3E2723]/20">
        <h2 className="text-3xl font-bold font-['Permanent_Marker'] text-center mb-8">What Our Customers Say</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white border-2 border-[#3E2723] p-6 shadow-[4px_4px_0px_0px_#8A9A5B]">
              <p className="italic text-[#3E2723]/80">"{test.text}"</p>
              <p className="mt-2 font-bold">— {test.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 text-center bg-[#3E2723] text-white">
        <h2 className="text-3xl font-bold font-['Permanent_Marker']">Come Visit Us Today!</h2>
        <p className="mt-2 text-white/80">We’d love to serve you.</p>
        <Link
          to="/menu"
          className="inline-block mt-6 px-8 py-3 bg-[#8A9A5B] text-white shadow-[8px_8px_0px_0px_#3E2723] hover:shadow-none transition-all font-bold"
        >
          View Our Menu →
        </Link>
      </section>

      <footer className="py-6 text-center border-t-2 border-[#3E2723] text-[#3E2723]/50 px-4 text-sm">
        <p>© {new Date().getFullYear()} {cafe.name}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;