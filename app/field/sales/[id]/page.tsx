'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { SALES_STATUS, INSTALL_CHECKLIST_TEMPLATE } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ChecklistView from '@/components/common/ChecklistView';
import ImageUpload from '@/components/common/ImageUpload';
import PhoneLink from '@/components/common/PhoneLink';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { SalesProject } from '@/types';

export default function FieldSalesDetailPage({ params }: { params: { id: string } }) {
  const { employee } = useAuth();
  const supabase = createClient();
  const [project, setProject] = useState<SalesProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    const { data } = await supabase
      .from('sales_projects')
      .select('*')
      .eq('id', params.id)
      .single();
    setProject(data);
    setLoading(false);
  };

  const handleChecklistChange = async (key: string, checked: boolean) => {
    if (!project) return;
    const checklist = { ...(project.install_checklist as Record<string, boolean>), [key]: checked };
    await supabase
      .from('sales_projects')
      .update({ install_checklist: checklist })
      .eq('id', params.id);
    await fetchProject();
  };

  const handleImageUpload = async (url: string) => {
    if (!project) return;
    const images = [...(project.images || []), url];
    await supabase
      .from('sales_projects')
      .update({ images })
      .eq('id', params.id);
    await fetchProject();
  };

  const handleComplete = async () => {
    if (!project || !employee) return;

    await supabase
      .from('sales_projects')
      .update({ sales_status: 'completed' })
      .eq('id', params.id);

    // 완료 알림
    await supabase.from('notifications').insert({
      type: 'sales_update',
      title: `설치 완료: ${project.store_name}`,
      body: `${employee.name}님이 ${project.store_name} 설치를 완료했습니다.`,
      target: 'all',
      related_sales_id: params.id,
    });

    await fetchProject();
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!project) {
    return (
      <>
        <TopBar title="설치" showBack />
        <EmptyState icon="package" title="프로젝트를 찾을 수 없습니다" />
      </>
    );
  }

  const statusConfig = SALES_STATUS[project.sales_status];
  const checklist = project.install_checklist || INSTALL_CHECKLIST_TEMPLATE;
  const allDone = Object.values(checklist).every((v) => v);
  const isCompleted = project.sales_status === 'completed';

  return (
    <>
      <TopBar title="설치 체크리스트" showBack />

      <div className="px-5 py-6 space-y-5">
        {/* 거래처 정보 */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <Badge label={statusConfig.label} color={statusConfig.color} />
            {project.install_date && (
              <span className="text-xs text-ios-subtext">
                설치일 {formatDate(project.install_date)}
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-ios-text mb-1">{project.store_name}</h2>
          {project.store_address && (
            <p className="text-sm text-ios-subtext mb-2">{project.store_address}</p>
          )}
          {project.store_phone && <PhoneLink phone={project.store_phone} />}
        </Card>

        {/* 설치 체크리스트 */}
        <div>
          <h3 className="text-base font-semibold text-ios-text mb-3">설치 체크리스트</h3>
          <ChecklistView
            checklist={checklist}
            onChange={isCompleted ? undefined : handleChecklistChange}
            readonly={isCompleted}
          />
        </div>

        {/* 사진 업로드 */}
        <div>
          <h3 className="text-base font-semibold text-ios-text mb-3">설치 사진</h3>
          <ImageUpload
            bucket="install-photos"
            folder={`install/${params.id}`}
            existingImages={project.images || []}
            onUpload={handleImageUpload}
          />
        </div>

        {/* 설치 완료 버튼 */}
        {!isCompleted && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleComplete}
            disabled={!allDone}
          >
            {allDone ? '설치 완료' : '체크리스트를 모두 완료해주세요'}
          </Button>
        )}

        {isCompleted && (
          <div className="text-center py-4">
            <span className="text-lg font-semibold text-[#34C759]">설치 완료</span>
          </div>
        )}
      </div>
    </>
  );
}
