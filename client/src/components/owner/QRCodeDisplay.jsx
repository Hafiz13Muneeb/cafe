// src/components/owner/QRCodeDisplay.jsx - QR code generator with download and copy
import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, QrCode } from 'lucide-react';
import Button from '../common/Button';

const QRCodeDisplay = ({ cafeName, slug, qrValue }) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      const link = document.createElement('a');
      link.download = `qr-${slug || 'cafe'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!qrValue) {
    return (
      <div className="bg-white border-2 border-[#3E2723] p-6 shadow-[6px_6px_0px_0px_#3E2723] text-center">
        <QrCode size={40} className="mx-auto text-[#3E2723]/30 mb-2" />
        <p className="text-[#3E2723]/60">No QR code available. Please save cafe settings first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[#3E2723] p-4 sm:p-6 shadow-[6px_6px_0px_0px_#3E2723] flex flex-col md:flex-row items-center gap-4 sm:gap-6">
      <div className="flex-shrink-0">
        <div ref={qrRef} className="p-2 border-2 border-[#3E2723] bg-white">
          <QRCodeSVG
            value={qrValue}
            size={140}
            className="sm:w-[180px] sm:h-[180px] w-[140px] h-[140px]"
            bgColor="#ffffff"
            fgColor="#3E2723"
            level="H"
            includeMargin={false}
          />
        </div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-base sm:text-lg font-bold text-[#3E2723] font-['Permanent_Marker']">
          {cafeName || 'Cafe'} QR Code
        </h3>
        <p className="text-xs sm:text-sm text-[#3E2723]/70 mt-1">
          Scan to view menu
        </p>
        <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
          <Button variant="primary" onClick={handleDownload} className="flex items-center gap-1 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
            <Download size={16} /> Download PNG
          </Button>
          <Button variant="secondary" onClick={handleCopy} className="flex items-center gap-1 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-[#3E2723]/50 mt-2 break-all">
          {qrValue}
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;