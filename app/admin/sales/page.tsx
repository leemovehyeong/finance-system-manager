'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { SALES_STATUS } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { SalesProject, SalesStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminSalesPage() {
  const [projects, setProjects] = useState<SalesProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SalesStatus | 'all'>('all');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    let query = supabase
      .from('sales_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('sales_status', filter);
    }

    const { data } = await query.limit(50);
    setProjects(data || []);
    setLoading(false);
  };

  const filters = [
    { key: 'all' as const, label: '전체' },
    ...Object.entries(SALES_STATUS).map(([key, config]) => ({
      key: key as SalesStatus,
      label: config.label,
    })),
  ];

  return (
    <>
      <TopBar
        title="영업/설치"
        rightAction={
          <Button size="sm" onClick={() => router.push('/admin/sales/new')}>
            + 새 프로젝트
          </Button>
        }
      />

      {/* 필터 */}
      <div className="px-5 pt-3 pb-2 overflow-x-auto">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap press-effect transition-colors',
                filter === f.key
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white text-ios-subtext'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : projects.length === 0 ? (
          <EmptyState icon="package" title="영업 프로젝트가 없습니다" />
        ) : (
          projects.map((project) => {
            const statusConfig = SALES_STATUS[project.sales_status];
            const checklistEntries = Object.entries(project.sales_checklist || {});
            const checklistDone = checklistEntries.filter(([, v]) => v).length;

            return (
              <Card
                key={project.id}
                className="press-effect cursor-pointer"
                onClick={() => router.push(`/admin/sales/${project.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-ios-subtext">#{project.project_number}</span>
                  <Badge label={statusConfig.label} color={statusConfig.color} />
                </div>
                <h3 className="text-base font-semibold text-ios-text mb-1">
                  {project.store_name}
                </h3>
                {project.owner_name && (
                  <p className="text-sm text-ios-subtext">{project.owner_name}</p>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-ios-subtext">
                  <span>
                    {project.install_date ? `설치 ${formatDate(project.install_date)}` : '설치 미정'}
                  </span>
                  {checklistEntries.length > 0 && (
                    <span>체크리스트 {checklistDone}/{checklistEntries.length}</span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
