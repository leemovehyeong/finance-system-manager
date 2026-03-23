import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { APP_NAME } from '@/lib/constants';
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'VAN/POS 업무관리 시스템',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}
