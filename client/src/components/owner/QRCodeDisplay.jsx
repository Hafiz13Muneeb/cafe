// src/components/owner/QRCodeDisplay.jsx - QR code display with modal
import React, { useState } from 'react';
import { QrCode, Maximize2, X } from 'lucide-react';
import QRCode from 'qrcode.react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const QRCodeDisplay = ({ cafeName, slug, qrValue }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Download QR code as PNG with cafe name overlay
  const downloadQR = () => {
    const qrCanvas = document.getElementById('qr-code-canvas');
    if (!qrCanvas) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 400;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Cafe name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(cafeName || 'Cafe Menu', width / 2, 30);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText('Scan to view menu', width / 2, 70);

    // QR code
    ctx.drawImage(qrCanvas, (width - 200) / 2, 110, 200, 200);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText(`/${slug || 'menu'}`, width / 2, 340);

    const link = document.createElement('a');
    link.download = `cafe-${slug}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-soft p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <QrCode size={24} className="text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-800">Menu QR Code</h3>
            <p className="text-sm text-gray-500">Scan to view your menu: /menu/{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Maximize2 size={16} />
            Show QR Code
          </Button>
          <Button
            variant="primary"
            onClick={downloadQR}
          >
            Download QR
          </Button>
        </div>
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title=""
        showCloseButton
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{cafeName || 'Cafe Menu'}</h2>
          <p className="text-sm text-gray-500 mb-4">Scan to view menu</p>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm inline-block mx-auto">
            <QRCode
              id="qr-code-canvas"
              value={qrValue}
              size={280}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <p className="text-xs text-gray-400 mt-4">/{slug || 'menu'}</p>
        </div>
      </Modal>
    </div>
  );
};

export default QRCodeDisplay;