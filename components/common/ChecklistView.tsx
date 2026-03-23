'use client';

import { cn } from '@/lib/utils';

interface ChecklistViewProps {
  checklist: Record<string, boolean>;
  onChange?: (key: string, checked: boolean) => void;
  readonly?: boolean;
}

export default function ChecklistView({ checklist, onChange, readonly = false }: ChecklistViewProps) {
  const entries = Object.entries(checklist);
  const completedCount = entries.filter(([, v]) => v).length;
  const totalCount = entries.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* 진행률 바 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ios-text">
            {completedCount}/{totalCount} 완료
          </span>
          <span className="text-sm font-medium" style={{ color: progress === 100 ? '#34C759' : '#007AFF' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? '#34C759' : '#007AFF',
            }}
          />
        </div>
      </div>

      {/* 체크리스트 아이템 */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {entries.map(([key, checked], idx) => {
          const label = key.replace(/_/g, ' ');
          return (
            <label
              key={key}
              className={cn(
                'flex items-center gap-3 px-5 py-3.5 cursor-pointer press-effect',
                idx < entries.length - 1 && 'border-b border-[#F2F2F7]',
                readonly && 'cursor-default'
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => !readonly && onChange?.(key, e.target.checked)}
                disabled={readonly}
                className="w-5 h-5 rounded accent-[#007AFF] flex-shrink-0"
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  checked ? 'text-ios-subtext line-through' : 'text-ios-text'
                )}
              >
                {label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
