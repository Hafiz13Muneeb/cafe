import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Settings, QrCode, MessageCircle } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Admin Setup',
    description: 'Create your digital menu in minutes. Simple, drag-and-drop dashboard.',
    icon: Settings,
    benefits: ['Bulk upload', 'Live updates', 'Categories'],
  },
  {
    id: 2,
    title: 'QR Placement',
    description: 'Generate unique QR codes. Place them anywhere in your cafe.',
    icon: QrCode,
    benefits: ['High-res files', 'Custom design', 'Table specific'],
  },
  {
    id: 3,
    title: 'Instant Ordering',
    description: 'Scan, browse, and order. Orders arrive straight to your WhatsApp.',
    icon: MessageCircle,
    benefits: ['No apps', 'Zero commission', 'Instant alerts'],
  }
];

const InteractiveDocs = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      className="py-16 sm:py-20 md:py-24 px-4 transition-colors duration-500"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-16 text-center"
          style={{
            fontFamily: "'Permanent Marker', cursive",
            color: 'var(--text-color)',
          }}
        >
          How It Works
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Steps Navigation */}
          <div className="space-y-3 sm:space-y-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className="w-full p-4 sm:p-6 border-4 transition-all"
                style={{
                  backgroundColor: activeStep === index ? 'var(--secondary-color)' : 'var(--card-bg)',
                  borderColor: activeStep === index ? '#3E2723' : 'var(--border-color)',
                  boxShadow: activeStep === index ? '6px 6px 0px 0px var(--primary-color)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeStep !== index) {
                    e.currentTarget.style.borderColor = 'rgba(var(--primary-color-rgb), 0.5)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeStep !== index) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                  }
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-[#3E2723] font-bold text-sm sm:text-base"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3
                      className="text-base sm:text-lg md:text-xl font-bold"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {step.title}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Content Panel */}
          <div
            className="p-6 sm:p-8 border-4 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723]"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3
                  className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
                  style={{
                    fontFamily: "'Permanent Marker', cursive",
                    color: 'var(--text-color)',
                  }}
                >
                  {steps[activeStep].title}
                </h3>
                <p
                  className="mb-6 sm:mb-8 text-base sm:text-lg"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {steps[activeStep].description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {steps[activeStep].benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 font-bold text-sm sm:text-base"
                      style={{ color: 'var(--text-color)' }}
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--primary-color)' }} />
                      {benefit}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDocs;