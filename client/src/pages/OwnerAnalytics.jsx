// src/pages/OwnerAnalytics.jsx - Modularized version
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import PeriodFilter from '../components/common/PeriodFilter';
import AnalyticsStats from '../components/analytics/AnalyticsStats';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import { AlertCircle, BarChart3 } from 'lucide-react'; // ✅ Added BarChart3

const OwnerAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');

  const periods = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  const fetchAnalytics = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/analytics/cafe/${user._id}?period=${period}`);
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view analytics. Please contact your administrator.');
      } else if (err.response?.status === 404) {
        setAnalytics(null);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Failed to load analytics');
      }
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period, user?._id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!analytics?.charts) return null;

    const { views, orderAttempts, completedOrders } = analytics.charts;

    const allDates = new Set();
    views.forEach((d) => allDates.add(d._id));
    orderAttempts.forEach((d) => allDates.add(d._id));
    completedOrders.forEach((d) => allDates.add(d._id));

    const labels = Array.from(allDates).sort();

    const getValue = (data, date) => {
      const entry = data.find((d) => d._id === date);
      return entry ? entry.count : 0;
    };

    const getRevenue = (date) => {
      const entry = completedOrders.find((d) => d._id === date);
      return entry ? entry.revenue : 0;
    };

    return {
      labels,
      viewsData: labels.map((d) => getValue(views, d)),
      attemptsData: labels.map((d) => getValue(orderAttempts, d)),
      ordersData: labels.map((d) => getValue(completedOrders, d)),
      revenueData: labels.map((d) => getRevenue(d)),
    };
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <DashboardLayout title="Analytics" subtitle={user?.cafeName}>
        <div className="bg-[#F5F5DC] p-6 border-2 border-[#3E2723] text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-[#8A9A5B] mb-2" />
          <p className="text-[#3E2723]/60">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analytics" subtitle={user?.cafeName}>
        <div className="bg-red-100 border-2 border-red-500 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">Failed to load analytics</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics" subtitle={user?.cafeName}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-[#3E2723]">Performance Overview</h2>
        <PeriodFilter periods={periods} selected={period} onSelect={setPeriod} />
      </div>

      {analytics ? (
        <>
          <AnalyticsStats analytics={analytics} />
          <AnalyticsCharts chartData={chartData} />
        </>
      ) : (
        <div className="bg-white border-2 border-[#3E2723] p-8 text-center shadow-[6px_6px_0px_0px_#EAE0C8]">
          <BarChart3 size={48} className="mx-auto text-[#3E2723]/30 mb-2" />
          <p className="text-[#3E2723]/60 font-bold">No analytics data available.</p>
          <p className="text-sm text-[#3E2723]/40">
            Start by sharing your menu QR code with customers. Analytics will appear once they start viewing and ordering.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerAnalytics;