'use client';

import BottomNav from '@/components/layout/BottomNav';

const adminNavItems = [
  { href: '/admin/dashboard', label: '홈', icon: 'home' as const },
  { href: '/admin/tickets', label: '티켓', icon: 'ticket' as const },
  { href: '/admin/stats', label: '통계', icon: 'chart' as const },
  { href: '/admin/employees', label: '직원', icon: 'people' as const },
  { href: '/admin/notifications', label: '알림', icon: 'bell' as const },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav items={adminNavItems} />
    </div>
  );
}
