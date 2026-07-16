// src/components/analytics/AnalyticsCharts.jsx - Independent chart types for each metric
import React, { useState } from 'react';
import LineChart from '../common/LineChart';
import ChartTypeSelector from './ChartTypeSelector';
import { BarChart3 } from 'lucide-react';

const AnalyticsCharts = ({ chartData }) => {
  // Each chart gets its own state
  const [viewsChartType, setViewsChartType] = useState('line');
  const [attemptsChartType, setAttemptsChartType] = useState('bar');
  const [ordersChartType, setOrdersChartType] = useState('bar');
  const [revenueChartType, setRevenueChartType] = useState('line');

  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className="bg-white border-2 border-[#3E2723] p-8 text-center shadow-[6px_6px_0px_0px_#EAE0C8]">
        <BarChart3 size={48} className="mx-auto text-[#3E2723]/30 mb-2" />
        <p className="text-[#3E2723]/60 font-bold">No analytics data available yet.</p>
        <p className="text-sm text-[#3E2723]/40">
          Data will appear once customers start viewing the menu and placing orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Views Chart */}
      <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-md font-bold text-[#3E2723]">Views</h3>
          <ChartTypeSelector selected={viewsChartType} onSelect={setViewsChartType} />
        </div>
        <LineChart
          labels={chartData.labels}
          data={chartData.viewsData}
          label="Views"
          color="#8A9A5B"
          height={220}
          chartType={viewsChartType}
        />
      </div>

      {/* Order Attempts Chart */}
      <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-md font-bold text-[#3E2723]">Order Attempts</h3>
          <ChartTypeSelector selected={attemptsChartType} onSelect={setAttemptsChartType} />
        </div>
        <LineChart
          labels={chartData.labels}
          data={chartData.attemptsData}
          label="Attempts"
          color="#d4a843"
          height={220}
          chartType={attemptsChartType}
        />
      </div>

      {/* Completed Orders Chart */}
      <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-md font-bold text-[#3E2723]">Completed Orders</h3>
          <ChartTypeSelector selected={ordersChartType} onSelect={setOrdersChartType} />
        </div>
        <LineChart
          labels={chartData.labels}
          data={chartData.ordersData}
          label="Orders"
          color="#10b981"
          height={220}
          chartType={ordersChartType}
        />
      </div>

      {/* Revenue Chart */}
      {chartData.revenueData?.some((v) => v > 0) && (
        <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-md font-bold text-[#3E2723]">Revenue Trend</h3>
            <ChartTypeSelector selected={revenueChartType} onSelect={setRevenueChartType} />
          </div>
          <LineChart
            labels={chartData.labels}
            data={chartData.revenueData}
            label="Revenue ($)"
            color="#3b82f6"
            height={220}
            chartType={revenueChartType}
          />
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;