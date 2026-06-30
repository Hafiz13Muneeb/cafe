import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ data, labels, label, color = '#8A9A5B', height = 250 }) => {
  const chartData = {
    labels: labels || [],
    datasets: [{ label: label || 'Data', data: data || [], borderColor: '#3E2723', backgroundColor: color + '40', fill: true, tension: 0, pointBackgroundColor: '#3E2723' }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#F5F5DC', titleColor: '#3E2723', bodyColor: '#3E2723', borderColor: '#3E2723', borderWidth: 2 } },
    scales: { y: { grid: { color: '#EAE0C8' } }, x: { grid: { display: false } } }
  };

  return <div style={{ height: `${height}px`, border: '2px solid #3E2723', padding: '10px', background: '#FFFFFF' }}><Line data={chartData} options={options} /></div>;
};
export default LineChart;