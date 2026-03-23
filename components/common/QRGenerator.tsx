'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Button from '@/components/ui/Button';

interface QRGeneratorProps {
  url: string;
  storeName: string;
}

export default function QRGenerator({ url, storeName }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    generateQR();
  }, [url]);

  const generateQR = async () => {
    if (!canvasRef.current) return;

    await QRCode.toCanvas(canvasRef.current, url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1C1C1E',
        light: '#FFFFFF',
      },
    });

    setGenerated(true);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `QR_${storeName.replace(/\s/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <canvas ref={canvasRef} className="rounded-xl" />
        </div>
      </div>

      {generated && (
        <div className="space-y-2">
          <Button
            size="md"
            variant="secondary"
            className="w-full"
            onClick={handleDownload}
          >
            QR 이미지 다운로드
          </Button>
          <p className="text-xs text-ios-subtext text-center break-all px-4">
            {url}
          </p>
        </div>
      )}
    </div>
  );
}
