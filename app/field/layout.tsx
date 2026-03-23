'use client';

import BottomNav, { HomeIcon, TicketIcon, TaskIcon, MapIcon, BellIcon } from '@/components/layout/BottomNav';

const fieldNavItems = [
  { href: '/field/dashboard', label: '홈', icon: <HomeIcon /> },
  { href: '/field/tickets', label: '피드', icon: <TicketIcon /> },
  { href: '/field/my-tasks', label: '내 업무', icon: <TaskIcon /> },
  { href: '/field/map', label: '지도', icon: <MapIcon /> },
  { href: '/field/notifications', label: '알림', icon: <BellIcon /> },
];

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <main className="pb-[80px]">
        {children}
      </main>
      <BottomNav items={fieldNavItems} />
    </div>
  );
}
