import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Hero from '../components/Hero';
import BentoShowcase from '../components/BentoShowcase';
import InteractiveDocs from '../components/InteractiveDocs';
import FAQ from '../components/FAQ';
import CursorGlow from '../components/CursorGlow';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const Home = () => {
  const { loading } = useTheme();

  if (loading) return <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center font-bold text-[#3E2723]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] overflow-x-hidden">
      <CursorGlow />
      <motion.div initial="visible" animate="visible"><Hero /></motion.div>
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
        <BentoShowcase />
      </motion.section>
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
        <InteractiveDocs />
      </motion.section>
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
        <FAQ />
      </motion.section>
      <footer className="py-10 text-center border-t-2 border-[#3E2723] text-[#3E2723]/60">
        <p>© 2026 CafeFlow. Optimized for production.</p>
      </footer>
    </div>
  );
};
export default Home;