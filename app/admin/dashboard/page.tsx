'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { APP_NAME, TICKET_STATUS, PAPER_TYPES } from '@/lib/constants';
import Card from '@/components/ui/Card';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket, TicketStatus, Employee, PaperStock } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [fieldEmployees, setFieldEmployees] = useState<(Employee & { activeCount: number })[]>([]);
  const [paperStock, setPaperStock] = useState<PaperStock[]>([]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/dashboard?role=admin');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `서버 오류 (${res.status})`);
      }
      const data = await res.json();
      setStats(data.stats || {});
      setRecentTickets(data.recentTickets || []);
      setFieldEmployees(data.fieldEmployees || []);
      setPaperStock(data.paperStock || []);
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
