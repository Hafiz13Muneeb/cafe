// src/pages/QRCodePage.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser } from '../store/slices/authSlice';
import { Lock } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import QRCodeDisplay from '../components/owner/QRCodeDisplay';

const QRCodePage = () => {
  const user = useSelector(selectUser);
  const isPaid = user?.subscription?.plan === 'paid' && user?.subscription?.status === 'active';

  return (
    <DashboardLayout title="QR Code" subtitle={user?.cafeName}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold font-['Permanent_Marker'] mb-4" style={{ color: 'var(--text-color)' }}>
          Your Cafe QR Code
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Download or copy the link to your digital menu QR code. Place it on your tables for customers to scan.
        </p>

        {isPaid ? (
          <QRCodeDisplay
            cafeName={user?.cafeName}
            slug={user?.slug}
            qrValue={`${window.location.origin}/menu/${user?.slug}`}
          />
        ) : (
          <div
            className="border-2 border-[#3E2723] p-8 text-center"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <Lock size={48} className="mx-auto mb-4" style={{ color: 'var(--primary-color)' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-color)' }}>
              QR Code Locked
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              QR codes are available for paid plans. Please upgrade to access and download your QR code.
            </p>
            <Link
              to="/admin/subscription"
              className="inline-block px-6 py-2 font-bold border-2 border-[#3E2723] hover:opacity-80 transition"
              style={{ backgroundColor: 'var(--primary-color)', color: '#ffffff' }}
            >
              Upgrade Now
            </Link>
          </div>
        )}

        <div
          className="mt-6 border-2 border-[#3E2723] p-4"
          style={{ backgroundColor: 'var(--secondary-color)' }}
        >
          <h3 className="font-bold" style={{ color: 'var(--text-color)' }}>Pro Tip</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Print the QR code and place it on every table. Customers can scan it directly with their phone camera to view your menu and place orders.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRCodePage;