// src/components/common/LineChart.jsx - Now supports line, bar, pie
import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ data, labels, label, color = '#8A9A5B', height = 220, chartType = 'line' }) => {
  const chartData = {
    labels: labels || [],
    datasets: [
      {
        label: label || 'Data',
        data: data || [],
        borderColor: color,
        backgroundColor: chartType === 'pie' ? undefined : color + '40',
        fill: chartType === 'line' ? true : false,
        tension: 0.3,
        pointBackgroundColor: color,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // For pie chart, use different colors
  if (chartType === 'pie') {
    const colors = [
      '#8A9A5B', '#d4a843', '#10b981', '#3b82f6', '#ef4444',
      '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#f97316',
    ];
    chartData.datasets[0].backgroundColor = colors.slice(0, data.length);
    chartData.datasets[0].borderColor = '#3E2723';
    chartData.datasets[0].borderWidth = 2;
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType === 'pie',
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

  const getChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={{ ...commonOptions, scales: { y: { grid: { color: '#EAE0C8' }, beginAtZero: true }, x: { grid: { display: false } } } }} />;
      case 'pie':
        return <Pie data={chartData} options={commonOptions} />;
      default:
        return <Line data={chartData} options={{ ...commonOptions, scales: { y: { grid: { color: '#EAE0C8' } }, x: { grid: { display: false } } } }} />;
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      {getChart()}
    </div>
  );
};

export default LineChart;