'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { APP_NAME, TICKET_STATUS, PAPER_TYPES } from '@/lib/constants';
import Card from '@/components/ui/Card';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket, TicketStatus, Employee, PaperStock } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [fieldEmployees, setFieldEmployees] = useState<(Employee & { activeCount: number })[]>([]);
  const [paperStock, setPaperStock] = useState<PaperStock[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    // 티켓 상태별 카운트
    const counts: Record<string, number> = {};
    for (const key of Object.keys(TICKET_STATUS)) {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', key);
      counts[key] = count || 0;
    }
    setStats(counts);

    // 최근 티켓
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentTickets(tickets || []);

    // 현장직 직원 + 진행 중 건수
    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .in('role', ['field', 'admin'])
      .eq('is_active', true);

    if (employees) {
      const withCounts = await Promise.all(
        employees.map(async (emp) => {
          const { count } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', emp.id)
            .in('status', ['accepted', 'in_progress']);
          return { ...emp, activeCount: count || 0 };
        })
      );
      setFieldEmployees(withCounts);
    }

    // 용지 재고
    const { data: stock } = await supabase
      .from('paper_stock')
      .select('*');
    setPaperStock(stock || []);

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
    <div className="px-5 pt-6 space-y-6">
      {/* 헤더 */}
      <div>
        <p className="text-sm text-ios-subtext mb-1">관리자</p>
        <h1 className="text-2xl font-semibold text-ios-text tracking-tight">
          {APP_NAME}
        </h1>
      </div>

      {/* 상태 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(TICKET_STATUS) as [TicketStatus, typeof TICKET_STATUS[TicketStatus]][]).slice(0, 4).map(([key, config]) => (
          <Card key={key} className="press-effect" onClick={() => router.push(`/admin/tickets?status=${key}`)}>
            <p className="text-sm text-ios-subtext mb-1">{config.label}</p>
            <p className="text-2xl font-semibold" style={{ color: config.color }}>
              {stats[key] || 0}
            </p>
          </Card>
        ))}
      </div>

      {/* 현장직 현황 */}
      <div>
        <h2 className="text-lg font-semibold text-ios-text mb-3">직원 현황</h2>
        <Card padding={false}>
          <div className="divide-y divide-[#F2F2F7]">
            {fieldEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F2F2F7] flex items-center justify-center text-sm font-medium text-ios-text">
                    {emp.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ios-text">{emp.name}</p>
                    <p className="text-xs text-ios-subtext">
                      {emp.role === 'admin' ? '관리자' : '현장직'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#007AFF]">{emp.activeCount}건</p>
                  <p className="text-xs text-ios-subtext">진행 중</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 용지 재고 */}
      <div>
        <h2 className="text-lg font-semibold text-ios-text mb-3">용지 재고</h2>
        <div className="grid grid-cols-3 gap-3">
          {paperStock.map((stock) => {
            const config = PAPER_TYPES[stock.type];
            const isLow = stock.quantity <= stock.low_threshold;
            return (
              <Card key={stock.id} className="text-center">
                <p className="text-xs text-ios-subtext mb-1">{config.label}</p>
                <p className={`text-xl font-semibold ${isLow ? 'text-[#FF3B30]' : 'text-ios-text'}`}>
                  {stock.quantity}
                </p>
                <p className="text-xs text-ios-subtext">{config.unit}</p>
                {isLow && (
                  <p className="text-[10px] text-[#FF3B30] mt-1 font-medium">부족</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* 최근 티켓 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ios-text">최근 티켓</h2>
          <button
            onClick={() => router.push('/admin/tickets')}
            className="text-sm text-[#007AFF] press-effect"
          >
            전체 보기
          </button>
        </div>
        {recentTickets.length === 0 ? (
          <EmptyState icon="📋" title="티켓이 없습니다" />
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} basePath="/admin" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
