// src/pages/SuperAdminCafeDetails.jsx - Cafe detail page with analytics and notes
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  ArrowLeft,
  Users,
  ShoppingBag,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import Button from '../components/common/Button';
import StatCard from '../components/common/StatCard';
import LineChart from '../components/common/LineChart';
import PeriodFilter from '../components/common/PeriodFilter';
import NoteList from '../components/superadmin/NoteList';
import ChartCard from '../components/common/ChartCard';

const SuperAdminCafeDetails = () => {
  const { cafeSlug } = useParams();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if not superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isSuperAdmin, navigate]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [notes, setNotes] = useState([]);
  const [cafeName, setCafeName] = useState('');

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  useEffect(() => {
    if (cafeSlug) {
      fetchData();
    }
  }, [cafeSlug, period]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // First, get the cafe ID from the slug
      const cafeRes = await api.get(`/users/owners`);
      const cafe = cafeRes.data.data.find((c) => c.slug === cafeSlug);
      if (!cafe) {
        setError('Cafe not found');
        setLoading(false);
        return;
      }
      setCafeName(cafe.cafeName || cafeSlug);

      // Fetch analytics
      const analyticsRes = await api.get(`/analytics/cafe/${cafe._id}?period=${period}`);
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }

      // Fetch notes
      const notesRes = await api.get(`/analytics/notes/${cafe._id}`);
      if (notesRes.data.success) {
        setNotes(notesRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cafe data:', err);
      setError(err.response?.data?.message || 'Failed to load cafe data');
    } finally {
      setLoading(false);
    }
  };

  // --- Note handlers ---
  const handleAddNote = async (noteData) => {
    const response = await api.post('/analytics/notes', noteData);
    if (response.data.success) {
      setNotes(prev => [response.data.data, ...prev]);
    }
    return response;
  };

  const handleEditNote = async (noteId, noteData) => {
    const response = await api.put(`/analytics/notes/${noteId}`, noteData);
    if (response.data.success) {
      setNotes(prev => prev.map(n => n._id === noteId ? response.data.data : n));
    }
    return response;
  };

  const handleDeleteNote = async (noteId) => {
    const response = await api.delete(`/analytics/notes/${noteId}`);
    if (response.data.success) {
      setNotes(prev => prev.filter(n => n._id !== noteId));
    }
    return response;
  };

  if (!isSuperAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading cafe data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button variant="primary" onClick={() => navigate('/admin/super')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const charts = analytics?.charts || {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/super')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
              {cafeName}
            </h1>
            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
              Analytics
            </span>
          </div>
          <Button variant="secondary" onClick={fetchData} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Period Filter */}
        <div className="flex items-center justify-between mb-6">
          <PeriodFilter periods={periods} selected={period} onSelect={setPeriod} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Last {period === 'week' ? '7 days' : period === 'month' ? '30 days' : '12 months'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Eye}
            label="Total Views"
            value={summary.totalViews || 0}
          />
          <StatCard
            icon={ShoppingBag}
            label="Orders"
            value={summary.totalOrders || 0}
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={summary.totalRevenue || 0}
            prefix="Rs. "
          />
          <StatCard
            icon={TrendingUp}
            label="Bounce Rate"
            value={summary.bounceRate || 0}
            suffix="%"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Views & Orders" subtitle="Daily activity">
            <LineChart
              data={charts.views?.map(d => d.count) || []}
              labels={charts.views?.map(d => d._id) || []}
              label="Views"
              color="#d4a843"
              height={220}
            />
          </ChartCard>
          <ChartCard title="Completed Orders" subtitle="Daily orders">
            <LineChart
              data={charts.completedOrders?.map(d => d.count) || []}
              labels={charts.completedOrders?.map(d => d._id) || []}
              label="Orders"
              color="#3b82f6"
              height={220}
            />
          </ChartCard>
        </div>

        {/* Notes */}
        <NoteList
          notes={notes}
          onAdd={handleAddNote}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          cafeId={analytics?.cafe?.id || ''}
        />
      </div>
    </div>
  );
};

export default SuperAdminCafeDetails;