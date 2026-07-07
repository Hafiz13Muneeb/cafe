import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Helper to get CSS variable value (with fallback)
const getCSSVar = (varName, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(varName).trim();
  return value || fallback;
};

const LineChart = ({ data, labels, label, color = '#8A9A5B', height = 250 }) => {
  // Read CSS variables at render time
  const bgColor = getCSSVar('--bg-color', '#f8fafc');
  const textColor = getCSSVar('--text-color', '#0f172a');
  const borderColor = getCSSVar('--border-color', '#e2e8f0');
  const secondaryColor = getCSSVar('--secondary-color', '#b8860b');

  const chartData = {
    labels: labels || [],
    datasets: [
      {
        label: label || 'Data',
        data: data || [],
        borderColor: '#3E2723', // fixed for contrast
        backgroundColor: color + '40', // use provided color with opacity
        fill: true,
        tension: 0,
        pointBackgroundColor: '#3E2723',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: bgColor,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: borderColor,
        borderWidth: 2,
      },
    },
    scales: {
      y: {
        grid: { color: secondaryColor },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div
      className="w-full border-2 border-[#3E2723] p-2 sm:p-3"
      style={{
        backgroundColor: 'var(--card-bg)',
        height: `${height}px`,
      }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;