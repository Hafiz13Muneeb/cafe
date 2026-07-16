// src/components/common/PieChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, labels, label, color = '#8A9A5B', height = 220 }) => {
  const colors = [
    '#8A9A5B', '#d4a843', '#10b981', '#3b82f6', '#ef4444',
    '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#f97316',
  ];

  const chartData = {
    labels: labels || [],
    datasets: [
      {
        label: label || 'Data',
        data: data || [],
        backgroundColor: colors.slice(0, (data || []).length),
        borderColor: '#3E2723',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 10 },
          color: '#3E2723',
          boxWidth: 12,
          padding: 8,
        },
      },
      tooltip: {
        backgroundColor: '#F5F5DC',
        titleColor: '#3E2723',
        bodyColor: '#3E2723',
        borderColor: '#3E2723',
        borderWidth: 2,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;