'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { TICKET_STATUS, TICKET_TYPES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import type { TicketStatus, TicketType } from '@/types';

export default function AdminStatsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // 상태별
    const sCounts: Record<string, number> = {};
    let total = 0;
    for (const key of Object.keys(TICKET_STATUS)) {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', key);
      sCounts[key] = count || 0;
      total += count || 0;
    }
    setStatusCounts(sCounts);
    setTotalCount(total);

    // 유형별
    const tCounts: Record<string, number> = {};
    for (const key of Object.keys(TICKET_TYPES)) {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('type', key);
      tCounts[key] = count || 0;
    }
    setTypeCounts(tCounts);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <>
      <TopBar title="통계" />

      <div className="px-5 py-6 space-y-6">
        {/* 총 티켓 */}
        <Card className="text-center">
          <p className="text-sm text-ios-subtext mb-1">총 티켓</p>
          <p className="text-4xl font-bold text-ios-text">{totalCount}</p>
        </Card>

        {/* 상태별 */}
        <div>
          <h2 className="text-lg font-semibold text-ios-text mb-3">상태별 현황</h2>
          <Card padding={false}>
            {(Object.entries(TICKET_STATUS) as [TicketStatus, typeof TICKET_STATUS[TicketStatus]][]).map(([key, config]) => {
              const count = statusCounts[key] || 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={key} className="px-5 py-3 border-b border-[#F2F2F7] last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-ios-text">{config.label}</span>
                    <span className="text-sm font-semibold" style={{ color: config.color }}>
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: config.color }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* 유형별 */}
        <div>
          <h2 className="text-lg font-semibold text-ios-text mb-3">유형별 현황</h2>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(TICKET_TYPES) as [TicketType, typeof TICKET_TYPES[TicketType]][]).map(([key, config]) => (
              <Card key={key} className="text-center">
                <p className="text-xs text-ios-subtext mb-1">{config.label}</p>
                <p className="text-xl font-semibold" style={{ color: config.color }}>
                  {typeCounts[key] || 0}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
