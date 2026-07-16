// src/components/common/BarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, labels, label, color = 'var(--primary-color)', height = 220 }) => {
  const chartData = {
    labels: labels || [],
    datasets: [
      {
        label: label || 'Data',
        data: data || [],
        backgroundColor: color + '80',
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#F5F5DC',
        titleColor: '#3E2723',
        bodyColor: '#3E2723',
        borderColor: '#3E2723',
        borderWidth: 2,
      },
    },
    scales: {
      y: { grid: { color: '#EAE0C8' }, beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;