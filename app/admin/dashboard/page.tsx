'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { APP_NAME, TICKET_STATUS, PAPER_TYPES } from '@/lib/constants';
import Card from '@/components/ui/Card';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket, TicketStatus, Employee, PaperStock } from '@/types';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export default function AdminDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [fieldEmployees, setFieldEmployees] = useState<(Employee & { activeCount: number })[]>([]);
  const [paperStock, setPaperStock] = useState<PaperStock[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const fetchAll = async () => {
    try {
      // 1) 먼저 인증 상태 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('[Dashboard] auth check:', { userId: user?.id, authError: authError?.message });

      if (!user) {
        setError('인증 세션이 없습니다. 다시 로그인해주세요.');
        setLoading(false);
        return;
      }

      // 2) 가장 간단한 쿼리부터 시도 (진단용)
      console.log('[Dashboard] starting queries...');

      const t1 = Date.now();
      const testQuery = await supabase.from('employees').select('id').limit(1);
      console.log('[Dashboard] test query:', {
        ms: Date.now() - t1,
        data: testQuery.data,
        error: testQuery.error?.message,
      });

      if (testQuery.error) {
        setError(`DB 연결 오류: ${testQuery.error.message}`);
        setLoading(false);
        return;
      }

      // 3) 실제 데이터 로드 (개별 에러 추적)
      const results = await Promise.allSettled([
        supabase.from('tickets').select('status').then(r => {
          console.log('[Dashboard] tickets/status:', { data: r.data?.length, error: r.error?.message });
          return r;
        }),
        supabase.from('tickets')
          .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
          .order('created_at', { ascending: false })
          .limit(5)
          .then(r => {
            console.log('[Dashboard] recent tickets:', { data: r.data?.length, error: r.error?.message });
            return r;
          }),
        supabase.from('employees')
          .select('*')
          .in('role', ['field', 'admin'])
          .eq('is_active', true)
          .then(r => {
            console.log('[Dashboard] employees:', { data: r.data?.length, error: r.error?.message });
            return r;
          }),
        supabase.from('paper_stock').select('*').then(r => {
          console.log('[Dashboard] paper_stock:', { data: r.data?.length, error: r.error?.message });
          return r;
        }),
      ]);

      const [statsResult, ticketsResult, employeesResult, stockResult] = results;

      // 상태별 카운트 집계
      if (statsResult.status === 'fulfilled' && statsResult.value.data) {
        const counts: Record<string, number> = {};
        for (const key of Object.keys(TICKET_STATUS)) {
          counts[key] = 0;
        }
        for (const ticket of statsResult.value.data) {
          if (ticket.status in counts) {
            counts[ticket.status]++;
          }
        }
        setStats(counts);
      }

      // 최근 티켓
      if (ticketsResult.status === 'fulfilled') {
        setRecentTickets(ticketsResult.value.data || []);
      }

      // 직원 + 진행 중 건수
      if (employeesResult.status === 'fulfilled' && employeesResult.value.data) {
        const employees = employeesResult.value.data;
        const { data: activeTickets } = await supabase
          .from('tickets')
          .select('assigned_to')
          .in('status', ['accepted', 'in_progress']);

        const countMap: Record<string, number> = {};
        if (activeTickets) {
          for (const t of activeTickets) {
            if (t.assigned_to) {
              countMap[t.assigned_to] = (countMap[t.assigned_to] || 0) + 1;
            }
          }
        }
        setFieldEmployees(employees.map((emp) => ({
          ...emp,
          activeCount: countMap[emp.id] || 0,
        })));
      }

      // 용지 재고
      if (stockResult.status === 'fulfilled') {
        setPaperStock(stockResult.value.data || []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다');
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

  if (error) {
    return (
      <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-ios-subtext text-sm">{error}</p>
        <button onClick={() => { setLoading(true); setError(null); fetchAll(); }} className="text-[#007AFF] text-sm font-medium">
          다시 시도
        </button>
        <button onClick={handleSignOut} className="text-[#FF3B30] text-sm mt-2">
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ios-subtext mb-1">관리자</p>
          <h1 className="text-2xl font-semibold text-ios-text tracking-tight">
            {APP_NAME}
          </h1>
        </div>
        <button onClick={handleSignOut} className="text-sm text-[#FF3B30] press-effect">
          로그아웃
        </button>
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
