'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import TopBar from '@/components/layout/TopBar';
import KakaoMap from '@/components/map/KakaoMap';
import RouteOptimizer from '@/components/map/RouteOptimizer';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import type { Ticket } from '@/types';

export default function FieldMapPage() {
  const { employee } = useAuth();
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (employee) fetchTickets();
  }, [employee]);

  const fetchTickets = async () => {
    if (!employee) return;

    // 오늘의 활성 티켓 (store 정보 포함)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: all } = await supabase
      .from('tickets')
      .select('*, store:stores(latitude, longitude)')
      .in('status', ['pending', 'accepted', 'in_progress'])
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    setAllTickets(all || []);

    // 내가 수락한 업무
    const { data: mine } = await supabase
      .from('tickets')
      .select('*, store:stores(latitude, longitude)')
      .eq('assigned_to', employee.id)
      .in('status', ['accepted', 'in_progress'])
      .order('accepted_at', { ascending: false });

    setMyTickets(mine || []);
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
      <TopBar title="실시간 A/S 지도" showBack />

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

        {/* 지도 */}
        <KakaoMap
          tickets={allTickets}
          basePath="/field"
          className="h-[50vh]"
          onTicketClick={(id) => router.push(`/field/tickets/${id}`)}
        />

        {/* 동선 최적화 (내 수락 업무) */}
        {myTickets.length > 0 && (
          <RouteOptimizer tickets={myTickets} />
        )}
      </div>
    </>
  );
}
