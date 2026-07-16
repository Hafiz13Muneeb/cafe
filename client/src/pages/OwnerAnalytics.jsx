// src/pages/OwnerAnalytics.jsx - Enhanced with insights & chart types
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import PeriodFilter from '../components/common/PeriodFilter';
import AnalyticsStats from '../components/analytics/AnalyticsStats';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import InsightsCards from '../components/analytics/InsightsCards';
import { AlertCircle, BarChart3 } from 'lucide-react';

const OwnerAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');

  const periods = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  const fetchAnalytics = useCallback(async () => {
    const cafeId = user?._id || 'fallback';
    setLoading(true);
    setError('');

    try {
      // Fetch analytics data
      const [analyticsRes, insightsRes] = await Promise.all([
        api.get(`/analytics/cafe/${cafeId}?period=${period}`),
        api.get(`/analytics/insights/${cafeId}?period=${period}`).catch(() => ({ data: { success: false } })),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      } else {
        setError('Failed to load analytics data');
      }

      if (insightsRes.data?.success) {
        setInsights(insightsRes.data.data);
      }
    } catch (err) {
      console.error('❌ Analytics fetch error:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to view analytics.');
      } else if (err.response?.status === 404) {
        setAnalytics(null);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  }, [period, user?._id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
        <div className="bg-[var(--bg-color)] p-6 border-2 border-[var(--border-color)] text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-primary mb-2" />
          <p className="text-[var(--text-color)]/60">Loading analytics...</p>
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
        <h2 className="text-lg font-bold text-[var(--text-color)]">Performance Overview</h2>
        <PeriodFilter periods={periods} selected={period} onSelect={setPeriod} />
      </div>

      {analytics ? (
        <>
          <AnalyticsStats analytics={analytics} />
          <InsightsCards insights={insights} />
          <AnalyticsCharts chartData={chartData} />
        </>
      ) : (
        <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-8 text-center shadow-[6px_6px_0px_0px_var(--border-color)]">
          <BarChart3 size={48} className="mx-auto text-[var(--text-color)]/30 mb-2" />
          <p className="text-[var(--text-color)]/60 font-bold">No analytics data available.</p>
          <p className="text-sm text-[var(--text-color)]/40">
            Start by sharing your menu QR code with customers.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerAnalytics;