'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  House,
  FileText,
  ChartBar,
  Users,
  Bell,
  Storefront,
  MapPin,
  CheckSquare,
} from '@phosphor-icons/react';

const iconComponents = {
  home: House,
  ticket: FileText,
  chart: ChartBar,
  people: Users,
  bell: Bell,
  store: Storefront,
  map: MapPin,
  task: CheckSquare,
};

export type IconName = keyof typeof iconComponents;

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-border-light pb-safe">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = iconComponents[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full press-effect',
                isActive ? 'text-black' : 'text-text-tertiary'
              )}
            >
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
