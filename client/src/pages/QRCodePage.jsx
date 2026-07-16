// src/pages/QRCodePage.jsx - Updated with correct slug
import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import QRCodeDisplay from '../components/owner/QRCodeDisplay';

const QRCodePage = () => {
  const { user } = useAuth();

  // Use user slug or fallback to 'cafe'
  const slug = user?.slug || 'cafe';

  return (
    <DashboardLayout title="QR Code" subtitle={user?.cafeName}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold font-['Permanent_Marker'] text-[var(--text-color)] mb-4">
          Your Cafe QR Code
        </h2>
        <p className="text-[var(--text-color)]/70 mb-6">
          Download or copy the link to your digital menu QR code. Place it on your tables for customers to scan.
        </p>
        <QRCodeDisplay
          cafeName={user?.cafeName}
          slug={slug}
          qrValue={`${window.location.origin}/menu/${slug}`}
        />
        <div className="mt-6 bg-[var(--bg-color)] border-2 border-[var(--border-color)] p-4">
          <h3 className="font-bold text-[var(--text-color)]">Pro Tip</h3>
          <p className="text-sm text-[var(--text-color)]/70">
            Print the QR code and place it on every table. Customers can scan it directly with their phone camera to view your menu and place orders.
          </p>
          <p className="text-xs text-[var(--text-color)]/50 mt-2">
            Your menu URL: <span className="font-mono">{window.location.origin}/menu/{slug}</span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRCodePage;