// src/pages/Blog/BlogArticle.jsx
import React from 'react';
import { motion } from 'framer-motion';

const BlogArticle = ({ activePost, fadeInUp }) => {
  return (
    <motion.article
      key={activePost.id}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="border-4 border-[#3E2723] p-6 sm:p-8 md:p-10"
      style={{
        backgroundColor: 'var(--card-bg)',
        boxShadow: '12px 12px 0px 0px var(--primary-color)',
      }}
    >
      <h1 className="text-2xl sm:text-4xl font-bold font-['Permanent_Marker'] mb-4" style={{ color: 'var(--text-color)' }}>
        {activePost.title}
      </h1>
      {activePost.render()}
    </motion.article>
  );
};

export default BlogArticle;