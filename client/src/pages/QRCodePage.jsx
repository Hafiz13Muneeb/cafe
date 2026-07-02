// src/pages/QRCodePage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import QRCodeDisplay from '../components/owner/QRCodeDisplay';

const QRCodePage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="QR Code" subtitle={user?.cafeName}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold font-['Permanent_Marker'] text-[#3E2723] mb-4">
          Your Cafe QR Code
        </h2>
        <p className="text-[#3E2723]/70 mb-6">
          Download or copy the link to your digital menu QR code. Place it on your tables for customers to scan.
        </p>
        <QRCodeDisplay
          cafeName={user?.cafeName}
          slug={user?.slug}
          qrValue={`${window.location.origin}/menu/${user?.slug}`}
        />
        <div className="mt-6 bg-[#EAE0C8] border-2 border-[#3E2723] p-4">
          <h3 className="font-bold text-[#3E2723]">Pro Tip</h3>
          <p className="text-sm text-[#3E2723]/70">
            Print the QR code and place it on every table. Customers can scan it directly with their phone camera to view your menu and place orders.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRCodePage;