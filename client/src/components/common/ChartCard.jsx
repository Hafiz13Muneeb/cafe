// src/components/common/ChartCard.jsx - Reusable chart wrapper
import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft p-4">
      {title && <h3 className="text-sm font-semibold text-gray-700">{title}</h3>}
      {subtitle && <p className="text-xs text-gray-400 mb-2">{subtitle}</p>}
      {children}
    </div>
  );
};

export default ChartCard;