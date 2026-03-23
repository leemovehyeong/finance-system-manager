'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import TopBar from '@/components/layout/TopBar';
import KakaoMap from '@/components/map/KakaoMap';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import type { Ticket } from '@/types';

export default function AdminMapPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*, store:stores(latitude, longitude), assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      setTickets(data || []);
    } catch (err) {
      console.error('Map tickets fetch error:', err);
    } finally {
      setLoading(false);
    }
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
      <TopBar title="전체 A/S 지도" showBack />

      <div className="px-5 py-4 space-y-4">
        {/* 범례 */}
        <div className="flex items-center gap-4 px-1">
          <span className="flex items-center gap-1 text-xs text-ios-subtext">
            <span className="w-3 h-3 rounded-full bg-[#FF3B30]" /> 긴급
          </span>
          <span className="flex items-center gap-1 text-xs text-ios-subtext">
            <span className="w-3 h-3 rounded-full bg-[#FF9500]" /> 대기
          </span>
          <span className="flex items-center gap-1 text-xs text-ios-subtext">
            <span className="w-3 h-3 rounded-full bg-[#007AFF]" /> 처리중
          </span>
          <span className="flex items-center gap-1 text-xs text-ios-subtext">
            <span className="w-3 h-3 rounded-full bg-[#34C759]" /> 설치
          </span>
        </div>

        {/* 요약 */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-2xl shadow-card p-3 text-center">
            <p className="text-xs text-ios-subtext">지도 위 티켓</p>
            <p className="text-xl font-semibold text-[#007AFF]">
              {tickets.filter((t) => t.store?.latitude).length}
            </p>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow-card p-3 text-center">
            <p className="text-xs text-ios-subtext">좌표 없음</p>
            <p className="text-xl font-semibold text-[#FF9500]">
              {tickets.filter((t) => !t.store?.latitude).length}
            </p>
          </div>
        </div>

        {/* 지도 */}
        <KakaoMap
          tickets={tickets}
          basePath="/admin"
          className="h-[60vh]"
          onTicketClick={(id) => router.push(`/admin/tickets/${id}`)}
        />
      </div>
    </>
  );
}
