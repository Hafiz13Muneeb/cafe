// src/components/analytics/AnalyticsStats.jsx
import React from 'react';
import StatCard from '../common/StatCard';
import { Eye, ShoppingBag, DollarSign, TrendingDown } from 'lucide-react';

const AnalyticsStats = ({ analytics }) => {
  const summary = analytics?.summary || {};

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <StatCard icon={Eye} label="Total Views" value={summary.totalViews || 0} />
      <StatCard icon={ShoppingBag} label="Total Orders" value={summary.totalOrders || 0} />
      <StatCard
        icon={DollarSign}
        label="Revenue"
        value={summary.totalRevenue || 0}
        prefix="$"
      />
      <StatCard
        icon={TrendingDown}
        label="Bounce Rate"
        value={summary.bounceRate || 0}
        suffix="%"
      />
    </div>
  );
};

export default AnalyticsStats;