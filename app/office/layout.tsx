'use client';

import BottomNav from '@/components/layout/BottomNav';

const officeNavItems = [
  { href: '/office/dashboard', label: '홈', icon: 'home' as const },
  { href: '/office/tickets', label: '티켓', icon: 'ticket' as const },
  { href: '/office/stores', label: '거래처', icon: 'store' as const },
  { href: '/office/notifications', label: '알림', icon: 'bell' as const },
];

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav items={officeNavItems} />
    </div>
  );
}
