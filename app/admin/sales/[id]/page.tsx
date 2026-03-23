'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
// useAuth not needed here currently
import { SALES_STATUS, SALES_CHECKLIST_TEMPLATE, INSTALL_CHECKLIST_TEMPLATE } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ChecklistView from '@/components/common/ChecklistView';
import DocumentUpload from '@/components/common/DocumentUpload';
import ImageUpload from '@/components/common/ImageUpload';
import PhoneLink from '@/components/common/PhoneLink';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { SalesProject, SalesStatus, Employee } from '@/types';

export default function SalesDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [project, setProject] = useState<SalesProject | null>(null);
  const [fieldEmployees, setFieldEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'sales_checklist' | 'install_checklist' | 'documents'>('info');

  useEffect(() => {
    fetchProject();
    fetchFieldEmployees();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const { data } = await supabase
        .from('sales_projects')
        .select('*')
        .eq('id', params.id)
        .single();
      setProject(data);
    } catch (err) {
      console.error('Project fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldEmployees = async () => {
    try {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .in('role', ['field', 'admin'])
        .eq('is_active', true);
      setFieldEmployees(data || []);
    } catch (err) {
      console.error('Field employees fetch error:', err);
    }
  };

  const updateProject = async (updates: Partial<SalesProject>) => {
    await supabase
      .from('sales_projects')
      .update(updates)
      .eq('id', params.id);
    await fetchProject();
  };

  const handleStatusChange = async (newStatus: SalesStatus) => {
    const updates: Record<string, unknown> = { sales_status: newStatus };
    if (newStatus === 'contracted') {
      updates.contract_date = new Date().toISOString().split('T')[0];
    }
    await updateProject(updates as Partial<SalesProject>);

    // 설치 배정 시 알림
    if (newStatus === 'install_scheduled' && project?.installer) {
      await supabase.from('notifications').insert({
        type: 'install_scheduled',
        title: `설치 배정: ${project.store_name}`,
        body: `${project.store_name} 설치가 배정되었습니다. ${project.install_date ? formatDate(project.install_date) : '일정 미정'}`,
        target: project.installer,
        related_sales_id: params.id,
      });
    }
  };

  const handleChecklistChange = async (type: 'sales_checklist' | 'install_checklist', key: string, checked: boolean) => {
    if (!project) return;
    const checklist = { ...(project[type] as Record<string, boolean>), [key]: checked };
    await updateProject({ [type]: checklist } as Partial<SalesProject>);
  };

  const handleDocumentUpload = async (doc: { name: string; url: string; type: string }) => {
    if (!project) return;
    const documents = [...(project.documents || []), doc];
    await updateProject({ documents } as Partial<SalesProject>);
  };

  const handleDocumentRemove = async (index: number) => {
    if (!project) return;
    const documents = [...(project.documents || [])];
    documents.splice(index, 1);
    await updateProject({ documents } as Partial<SalesProject>);
  };

  const handleImageUpload = async (url: string) => {
    if (!project) return;
    const images = [...(project.images || []), url];
    await updateProject({ images } as Partial<SalesProject>);
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
        <TopBar title="프로젝트 상세" showBack />
        <EmptyState icon="package" title="프로젝트를 찾을 수 없습니다" />
      </>
    );
  }

  const statusConfig = SALES_STATUS[project.sales_status];
  const statusOptions = Object.entries(SALES_STATUS).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const installerOptions = [
    { value: '', label: '미배정' },
    ...fieldEmployees.map((emp) => ({ value: emp.id, label: emp.name })),
  ];

  const tabs = [
    { key: 'info' as const, label: '정보' },
    { key: 'sales_checklist' as const, label: '영업' },
    { key: 'install_checklist' as const, label: '설치' },
    { key: 'documents' as const, label: '서류' },
  ];

  return (
    <>
      <TopBar title={`#${project.project_number} ${project.store_name}`} showBack />

      <div className="px-5 py-4 space-y-4">
        {/* 상태 + 번호 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <Badge label={statusConfig.label} color={statusConfig.color} />
            <span className="text-xs text-ios-subtext">#{project.project_number}</span>
          </div>
          <h2 className="text-xl font-semibold text-ios-text mb-1">{project.store_name}</h2>
          {project.owner_name && (
            <p className="text-sm text-ios-subtext">{project.owner_name}</p>
          )}
          {project.store_phone && (
            <div className="mt-2">
              <PhoneLink phone={project.store_phone} />
            </div>
          )}
        </Card>

        {/* 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap press-effect transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white text-ios-subtext'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 정보 탭 */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* 상태 변경 */}
            <Card>
              <h3 className="text-sm font-semibold text-ios-text mb-3">상태 변경</h3>
              <Select
                options={statusOptions}
                value={project.sales_status}
                onChange={(e) => handleStatusChange(e.target.value as SalesStatus)}
              />
            </Card>

            {/* 설치 배정 */}
            <Card>
              <h3 className="text-sm font-semibold text-ios-text mb-3">설치 배정</h3>
              <div className="space-y-3">
                <Select
                  label="설치 담당자"
                  options={installerOptions}
                  value={project.installer || ''}
                  onChange={(e) => updateProject({ installer: e.target.value || null } as Partial<SalesProject>)}
                />
                <Input
                  label="설치 예정일"
                  type="date"
                  value={project.install_date || ''}
                  onChange={(e) => updateProject({ install_date: e.target.value || null } as Partial<SalesProject>)}
                />
                <Input
                  label="오픈 예정일"
                  type="date"
                  value={project.open_date || ''}
                  onChange={(e) => updateProject({ open_date: e.target.value || null } as Partial<SalesProject>)}
                />
              </div>
            </Card>

            {/* 상세 정보 */}
            <Card>
              <h3 className="text-sm font-semibold text-ios-text mb-3">상세 정보</h3>
              <div className="space-y-2 text-sm">
                {project.store_address && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">주소</span>
                    <span className="text-ios-text text-right max-w-[60%]">{project.store_address}</span>
                  </div>
                )}
                {project.business_number && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">사업자번호</span>
                    <span className="text-ios-text">{project.business_number}</span>
                  </div>
                )}
                {project.franchise && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">프랜차이즈</span>
                    <span className="text-ios-text">{project.franchise}</span>
                  </div>
                )}
                {project.contract_type && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">계약 유형</span>
                    <span className="text-ios-text">
                      {project.contract_type === 'purchase' ? '매입' : project.contract_type === 'lease' ? '리스' : '위탁'}
                    </span>
                  </div>
                )}
                {project.contract_date && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">계약일</span>
                    <span className="text-ios-text">{formatDate(project.contract_date)}</span>
                  </div>
                )}
              </div>
              {project.memo && (
                <div className="mt-3 pt-3 border-t border-[#F2F2F7]">
                  <p className="text-xs text-ios-subtext mb-1">메모</p>
                  <p className="text-sm text-ios-text">{project.memo}</p>
                </div>
              )}
            </Card>

            {/* 사진 */}
            <Card>
              <h3 className="text-sm font-semibold text-ios-text mb-3">사진</h3>
              <ImageUpload
                bucket="install-photos"
                folder={`sales/${params.id}`}
                existingImages={project.images || []}
                onUpload={handleImageUpload}
              />
            </Card>
          </div>
        )}

        {/* 영업 체크리스트 */}
        {activeTab === 'sales_checklist' && (
          <div>
            <h3 className="text-base font-semibold text-ios-text mb-3">영업 체크리스트</h3>
            <ChecklistView
              checklist={project.sales_checklist || SALES_CHECKLIST_TEMPLATE}
              onChange={(key, checked) => handleChecklistChange('sales_checklist', key, checked)}
            />
          </div>
        )}

        {/* 설치 체크리스트 */}
        {activeTab === 'install_checklist' && (
          <div>
            <h3 className="text-base font-semibold text-ios-text mb-3">설치 체크리스트</h3>
            <ChecklistView
              checklist={project.install_checklist || INSTALL_CHECKLIST_TEMPLATE}
              onChange={(key, checked) => handleChecklistChange('install_checklist', key, checked)}
            />
          </div>
        )}

        {/* 서류 */}
        {activeTab === 'documents' && (
          <div>
            <h3 className="text-base font-semibold text-ios-text mb-3">서류</h3>
            <DocumentUpload
              bucket="sales-documents"
              folder={`sales/${params.id}`}
              documents={project.documents || []}
              onUpload={handleDocumentUpload}
              onRemove={handleDocumentRemove}
            />
          </div>
        )}
      </div>
    </>
  );
}
