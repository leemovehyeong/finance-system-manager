'use client';

import BottomNav from '@/components/layout/BottomNav';

const fieldNavItems = [
  { href: '/field/dashboard', label: '홈', icon: 'home' as const },
  { href: '/field/tickets', label: '피드', icon: 'ticket' as const },
  { href: '/field/my-tasks', label: '내 업무', icon: 'task' as const },
  { href: '/field/map', label: '지도', icon: 'map' as const },
  { href: '/field/notifications', label: '알림', icon: 'bell' as const },
];

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav items={fieldNavItems} />
    </div>
  );
}
