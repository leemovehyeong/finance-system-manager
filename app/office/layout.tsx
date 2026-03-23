'use client';

import BottomNav, { HomeIcon, TicketIcon, StoreIcon, BellIcon } from '@/components/layout/BottomNav';

const officeNavItems = [
  { href: '/office/dashboard', label: '홈', icon: <HomeIcon /> },
  { href: '/office/tickets', label: '티켓', icon: <TicketIcon /> },
  { href: '/office/stores', label: '거래처', icon: <StoreIcon /> },
  { href: '/office/notifications', label: '알림', icon: <BellIcon /> },
];

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <main className="pb-[80px]">
        {children}
      </main>
      <BottomNav items={officeNavItems} />
    </div>
  );
}
