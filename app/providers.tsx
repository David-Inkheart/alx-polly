'use client';

import { AuthProvider } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import Toaster to avoid hydration issues
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => ({ default: mod.Toaster })),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
