'use client';

import BottomNav, { HomeIcon, TicketIcon, ChartIcon, PeopleIcon, BellIcon } from '@/components/layout/BottomNav';

const adminNavItems = [
  { href: '/admin/dashboard', label: '홈', icon: <HomeIcon /> },
  { href: '/admin/tickets', label: '티켓', icon: <TicketIcon /> },
  { href: '/admin/stats', label: '통계', icon: <ChartIcon /> },
  { href: '/admin/employees', label: '직원', icon: <PeopleIcon /> },
  { href: '/admin/notifications', label: '알림', icon: <BellIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <main className="pb-[80px]">
        {children}
      </main>
      <BottomNav items={adminNavItems} />
    </div>
  );
}
