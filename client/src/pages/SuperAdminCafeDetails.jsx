// src/pages/SuperAdminCafeDetails.jsx - Full analytics dashboard with notes
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import NoteList from '../components/superadmin/NoteList';
import StatCard from '../components/common/StatCard';
import PeriodFilter from '../components/common/PeriodFilter';
import LineChart from '../components/common/LineChart';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Eye, ShoppingBag, DollarSign, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';

const SuperAdminCafeDetails = () => {
  const { cafeSlug } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const [cafeName, setCafeName] = useState('');
  const [cafeId, setCafeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const periods = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    if (!isSuperAdmin) navigate('/admin/dashboard');
  }, [isSuperAdmin, navigate]);

  const fetchNotes = async (id) => {
    try {
      setNotesLoading(true);
      const res = await api.get(`/analytics/notes/${id}`);
      setNotes(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchAnalytics = async (id, periodParam) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      const timestamp = Date.now();
      const res = await api.get(`/analytics/cafe/${id}?period=${periodParam}&_t=${timestamp}`);
      console.log('Analytics response:', res);
      if (res.data && res.data.success) {
        const data = res.data.data;
        if (data && data.summary && data.charts) {
          setAnalytics(data);
        } else {
          setAnalytics(data);
          setAnalyticsError('Received incomplete analytics data.');
        }
      } else {
        setAnalyticsError('Invalid response from server.');
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalyticsError(err.response?.data?.message || err.message || 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const ownersRes = await api.get('/users/owners');
      const cafe = ownersRes.data.data?.find((c) => c.slug === cafeSlug);

      if (!cafe) {
        setError('Cafe not found');
        return;
      }

      setCafeName(cafe.cafeName || '');
      setCafeId(cafe._id);

      await Promise.all([
        fetchNotes(cafe._id),
        fetchAnalytics(cafe._id, period),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cafeId) {
      fetchAnalytics(cafeId, period);
    }
  }, [period, cafeId]);

  useEffect(() => {
    fetchData();
  }, [cafeSlug]);

  const handleAddNote = async (noteData) => {
    try {
      const response = await api.post('/analytics/notes', noteData);
      if (response.data.success) {
        setNotes(prev => [response.data.data, ...prev]);
      }
      return response.data;
    } catch (err) {
      console.error('Failed to add note:', err);
      throw err;
    }
  };

  const handleEditNote = async (noteId, noteData) => {
    try {
      const response = await api.put(`/analytics/notes/${noteId}`, noteData);
      if (response.data.success) {
        setNotes(prev => prev.map(n => n._id === noteId ? response.data.data : n));
      }
      return response.data;
    } catch (err) {
      console.error('Failed to update note:', err);
      throw err;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/analytics/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
      throw err;
    }
  };

  const prepareChartData = () => {
    if (!analytics || !analytics.charts) return null;

    const { views, orderAttempts, completedOrders } = analytics.charts;

    const allDates = new Set();
    views.forEach(d => allDates.add(d._id));
    orderAttempts.forEach(d => allDates.add(d._id));
    completedOrders.forEach(d => allDates.add(d._id));

    const labels = Array.from(allDates).sort();

    const getValue = (data, date) => {
      const entry = data.find(d => d._id === date);
      return entry ? entry.count : 0;
    };

    const getRevenue = (date) => {
      const entry = completedOrders.find(d => d._id === date);
      return entry ? entry.revenue : 0;
    };

    return {
      labels,
      viewsData: labels.map(d => getValue(views, d)),
      attemptsData: labels.map(d => getValue(orderAttempts, d)),
      ordersData: labels.map(d => getValue(completedOrders, d)),
      revenueData: labels.map(d => getRevenue(d)),
    };
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Analytics">
        <div className="bg-[#F5F5DC] p-6 border-2 border-[#3E2723] text-center">
          <p className="text-[#3E2723]/60">Loading cafe details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error" subtitle="Analytics">
        <div className="bg-[#F5F5DC] p-6 border-2 border-[#3E2723] bg-red-100">
          <p className="text-red-600 font-bold">{error}</p>
          <button
            onClick={() => navigate('/admin/super')}
            className="mt-4 px-4 py-2 border-2 border-[#3E2723] bg-[#8A9A5B] text-white font-bold"
          >
            Back to Owners
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = prepareChartData();

  return (
    <DashboardLayout title={cafeName || 'Cafe Details'} subtitle="Analytics & Notes">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-[#3E2723]">Performance Overview</h2>
        <PeriodFilter periods={periods} selected={period} onSelect={setPeriod} />
      </div>

      {analyticsLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border-2 border-[#3E2723] p-3 sm:p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {!analyticsLoading && analyticsError && (
        <div className="bg-red-100 border-2 border-red-500 p-4 mb-4 flex flex-col sm:flex-row items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">Failed to load analytics:</p>
            <p className="text-red-600 text-sm">{analyticsError}</p>
          </div>
        </div>
      )}

      {!analyticsLoading && analytics && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard
              icon={Eye}
              label="Total Views"
              value={analytics.summary.totalViews}
            />
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={analytics.summary.totalOrders}
            />
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value={analytics.summary.totalRevenue}
              prefix="Rs. "
            />
            <StatCard
              icon={TrendingDown}
              label="Bounce Rate"
              value={analytics.summary.bounceRate}
              suffix="%"
            />
          </div>

          {chartData && chartData.labels.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
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
                <h3 className="text-md font-bold text-[#3E2723] mb-2">Completed Orders</h3>
                <LineChart
                  labels={chartData.labels}
                  data={chartData.ordersData}
                  label="Orders"
                  color="#d4a843"
                  height={200}
                />
              </div>
              <div className="bg-white border-2 border-[#3E2723] p-4 shadow-[6px_6px_0px_0px_#EAE0C8] lg:col-span-2">
                <h3 className="text-md font-bold text-[#3E2723] mb-2">Revenue Trend</h3>
                <LineChart
                  labels={chartData.labels}
                  data={chartData.revenueData}
                  label="Revenue (Rs.)"
                  color="#3b82f6"
                  height={200}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#3E2723] p-6 sm:p-8 text-center shadow-[6px_6px_0px_0px_#EAE0C8] mb-6">
              <BarChart3 size={48} className="mx-auto text-[#3E2723]/30 mb-2" />
              <p className="text-[#3E2723]/60 font-bold">No analytics data available yet.</p>
              <p className="text-sm text-[#3E2723]/40">Data will appear once customers start viewing the menu and placing orders.</p>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-bold text-[#3E2723] mb-2">Notes</h3>
        <NoteList
          notes={notes}
          cafeId={cafeId}
          onAdd={handleAddNote}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          loading={notesLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminCafeDetails;