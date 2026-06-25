// src/components/CursorGlow.jsx - Subtle radial gradient following mouse
import React, { useEffect, useState } from 'react';

const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-0 inset-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.08), transparent 80%)`,
      }}
    />
  );
};

export default CursorGlow;