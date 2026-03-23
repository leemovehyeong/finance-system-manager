'use client';

import { useRouter } from 'next/navigation';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function TopBar({ title, showBack, rightAction }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/72 border-b border-black/[0.08]">
      <div className="flex items-center justify-between h-[56px] px-5">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="press-effect -ml-1 p-1"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-ios-text tracking-tight">{title}</h1>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
