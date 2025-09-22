'use client';

import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface ClientQRCodeCanvasProps {
  pollId: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
}

export default function ClientQRCodeCanvas({
  pollId,
  size,
  level,
}: ClientQRCodeCanvasProps) {
  // Ensure the component only renders on the client after hydration
  const [isClient, setIsClient] = useState(false);
  const [qrValue, setQrValue] = useState<string>('');

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      try {
        // Sanitize pollId to prevent XSS
        const sanitizedPollId = encodeURIComponent(
          pollId.replace(/[^a-zA-Z0-9-_]/g, '')
        );
        if (!sanitizedPollId) {
          setQrValue('');
          return;
        }
        const url = new URL(
          `/polls/${sanitizedPollId}`,
          window.location.origin
        );
        setQrValue(url.toString());
      } catch (error) {
        console.error('Failed to construct QR code URL:', error);
        setQrValue('');
      }
    }
  }, [pollId]);

  if (!isClient) {
    return null;
  }

  if (!qrValue) {
    return (
      <div className='text-red-600 text-center'>
        Error: Invalid poll ID for QR code.
      </div>
    );
  }

  return <QRCodeCanvas value={qrValue} size={size} level={level} />;
}
