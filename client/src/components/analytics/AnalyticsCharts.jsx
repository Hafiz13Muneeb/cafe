// src/components/analytics/AnalyticsCharts.jsx
import React from 'react';
import LineChart from '../common/LineChart';
import { BarChart3 } from 'lucide-react';

const AnalyticsCharts = ({ chartData }) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
        <h3 className="text-md font-bold text-[#3E2723] mb-2">Views</h3>
        <LineChart
          labels={chartData.labels}
          data={chartData.viewsData}
          label="Views"
          color="#8A9A5B"
          height={200}
        />
      </div>
      <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
        <h3 className="text-md font-bold text-[#3E2723] mb-2">Order Attempts</h3>
        <LineChart
          labels={chartData.labels}
          data={chartData.attemptsData}
          label="Attempts"
          color="#d4a843"
          height={200}
        />
      </div>
      <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
        <h3 className="text-md font-bold text-[#3E2723] mb-2">Completed Orders</h3>
        <LineChart
          labels={chartData.labels}
          data={chartData.ordersData}
          label="Orders"
          color="#10b981"
          height={200}
        />
      </div>
      {chartData.revenueData?.some((v) => v > 0) && (
        <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8]">
          <h3 className="text-md font-bold text-[#3E2723] mb-2">Revenue Trend</h3>
          <LineChart
            labels={chartData.labels}
            data={chartData.revenueData}
            label="Revenue ($)"
            color="#3b82f6"
            height={200}
          />
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;