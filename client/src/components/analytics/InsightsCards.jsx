// src/components/analytics/InsightsCards.jsx - Busiest Days & Top Items
import React from 'react';
import { Calendar, TrendingUp, Award } from 'lucide-react';

const InsightsCards = ({ insights }) => {
  if (!insights) return null;

  const { busiestDays, topItems } = insights;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Busiest Days */}
      <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-4 shadow-[6px_6px_0px_0px_var(--border-color)]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={20} className="text-primary" />
          <h3 className="text-md font-bold text-[var(--text-color)]">Busiest Days</h3>
        </div>
        {busiestDays && busiestDays.length > 0 ? (
          <div className="space-y-2">
            {busiestDays.slice(0, 5).map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-[var(--border-color)]/10 pb-2 last:border-0"
              >
                <span className="font-bold text-[var(--text-color)]">
                  {dayNames[day._id]}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-[var(--bg-color)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min((day.count / busiestDays[0].count) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[var(--text-color)]">{day.count} orders</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-color)]/60">No order data available yet.</p>
        )}
      </div>

      {/* Top Selling Items */}
      <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-4 shadow-[6px_6px_0px_0px_var(--border-color)]">
        <div className="flex items-center gap-2 mb-3">
          <Award size={20} className="text-primary" />
          <h3 className="text-md font-bold text-[var(--text-color)]">Top Selling Items</h3>
        </div>
        {topItems && topItems.length > 0 ? (
          <div className="space-y-2">
            {topItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-[var(--border-color)]/10 pb-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text-color)]/40 w-5">
                    #{index + 1}
                  </span>
                  <span className="font-bold text-[var(--text-color)]">{item.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--text-color)]">{item.count} orders</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-color)]/60">No order data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsCards;