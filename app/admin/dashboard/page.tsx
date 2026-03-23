'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { APP_NAME, TICKET_STATUS, PAPER_TYPES } from '@/lib/constants';
import Card from '@/components/ui/Card';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { SignOut, Package, ArrowRight } from '@phosphor-icons/react';
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
    await fetch('/api/auth/signout', { method: 'POST' });
    signOut();
    router.push('/login');
    router.refresh();
  };

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/dashboard?role=admin');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
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

  if (loading) return <div className="px-5 pt-6"><DashboardSkeleton /></div>;

  if (error) {
    return (
      <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-caption text-text-tertiary">{error}</p>
        <button onClick={() => { setLoading(true); setError(null); fetchAll(); }} className="text-caption text-black font-medium">다시 시도</button>
        <button onClick={handleSignOut} className="text-caption text-status-urgent mt-2">로그아웃</button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption text-text-tertiary mb-1">관리자</p>
          <h1 className="text-display text-text-primary">{APP_NAME}</h1>
        </div>
        <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center press-effect">
          <SignOut size={18} className="text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(TICKET_STATUS) as [TicketStatus, typeof TICKET_STATUS[TicketStatus]][]).slice(0, 4).map(([key, config]) => (
          <Card key={key} className="press-effect cursor-pointer" onClick={() => router.push(`/admin/tickets?status=${key}`)}>
            <p className="text-caption text-text-tertiary mb-2">{config.label}</p>
            <p className="text-[2rem] font-bold text-text-primary leading-none">{stats[key] || 0}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-title text-text-primary mb-3">직원 현황</h2>
        <Card padding={false}>
          <div className="divide-y divide-border-light">
            {fieldEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-sm font-semibold text-white">
                    {emp.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-body font-medium text-text-primary">{emp.name}</p>
                    <p className="text-micro text-text-tertiary">{emp.role === 'admin' ? '관리자' : '현장직'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-body font-bold text-text-primary">{emp.activeCount}</p>
                  <p className="text-micro text-text-tertiary">진행 중</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {paperStock.length > 0 && (
        <div>
          <h2 className="text-title text-text-primary mb-3">용지 재고</h2>
          <div className="grid grid-cols-3 gap-3">
            {paperStock.map((stock) => {
              const config = PAPER_TYPES[stock.type];
              const isLow = stock.quantity <= stock.low_threshold;
              return (
                <Card key={stock.id} className="text-center">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center mx-auto mb-2">
                    <Package size={16} className="text-text-secondary" />
                  </div>
                  <p className="text-micro text-text-tertiary mb-1">{config.label}</p>
                  <p className={`text-title ${isLow ? 'text-status-urgent' : 'text-text-primary'}`}>{stock.quantity}</p>
                  <p className="text-micro text-text-tertiary">{config.unit}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-title text-text-primary">최근 티켓</h2>
          <button onClick={() => router.push('/admin/tickets')} className="flex items-center gap-1 text-caption text-text-secondary press-effect">
            전체 보기 <ArrowRight size={14} />
          </button>
        </div>
        {recentTickets.length === 0 ? (
          <EmptyState icon="clipboard" title="티켓이 없습니다" />
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
