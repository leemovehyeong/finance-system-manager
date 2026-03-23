'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function TopBar({ title, showBack, rightAction }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border-light">
      <div className="flex items-center justify-between h-14 px-5">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="press-effect -ml-1 w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-secondary"
            >
              <ArrowLeft size={20} weight="bold" className="text-text-primary" />
            </button>
          )}
          <h1 className="text-body font-semibold text-text-primary">{title}</h1>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
