'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ROLES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import PhoneLink from '@/components/common/PhoneLink';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import type { Employee, Role } from '@/types';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingEmployees, setPendingEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 승인 폼
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<string>('field');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 승인된 직원 (role이 있는)
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .not('role', 'is', null)
      .order('role')
      .order('name');
    setEmployees(empData || []);

    // 대기 사용자 (role이 null인)
    const { data: pendingData } = await supabase
      .from('employees')
      .select('*')
      .is('role', null)
      .order('created_at', { ascending: false });
    setPendingEmployees(pendingData || []);

    setLoading(false);
  };

  const handleApprove = async (emp: Employee) => {
    if (!editName.trim()) return;

    await supabase
      .from('employees')
      .update({
        name: editName,
        role: editRole,
        phone: editPhone || null,
      })
      .eq('id', emp.id);

    setEditingId(null);
    setEditName('');
    setEditRole('field');
    setEditPhone('');
    fetchData();
  };

  const handleRoleChange = async (employeeId: string, newRole: Role) => {
    await supabase
      .from('employees')
      .update({ role: newRole })
      .eq('id', employeeId);
    fetchData();
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm('이 직원을 삭제하시겠습니까?')) return;
    await supabase.from('employees').delete().eq('id', employeeId);
    fetchData();
  };

  const roleColor: Record<Role, string> = {
    admin: '#FF3B30',
    office: '#007AFF',
    field: '#34C759',
  };

  const roleOptions = Object.entries(ROLES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  return (
    <>
      <TopBar title="직원 관리" />

      <div className="px-5 py-4 space-y-6">
        {/* 승인 대기 */}
        {pendingEmployees.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-ios-text mb-3">
              승인 대기
              <span className="ml-2 text-sm font-normal text-[#FF9500]">{pendingEmployees.length}명</span>
            </h2>
            <div className="space-y-3">
              {pendingEmployees.map((emp) => (
                <Card key={emp.id} className="border-l-4 border-[#FF9500]">
                  {editingId === emp.id ? (
                    <div className="space-y-3">
                      <p className="text-xs text-ios-subtext">{emp.email}</p>
                      <Input
                        label="이름"
                        placeholder="직원 이름"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <Select
                        label="역할"
                        options={roleOptions}
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                      />
                      <Input
                        label="전화번호"
                        type="tel"
                        placeholder="010-0000-0000 (선택)"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="flex-1" onClick={() => setEditingId(null)}>
                          취소
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleApprove(emp)}>
                          승인
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium text-ios-text">{emp.name}</p>
                        <p className="text-sm text-ios-subtext">{emp.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingId(emp.id);
                            setEditName(emp.name);
                            setEditRole('field');
                            setEditPhone('');
                          }}
                        >
                          배정
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>
                          삭제
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 등록된 직원 */}
        <div>
          <h2 className="text-lg font-semibold text-ios-text mb-3">직원 ({employees.length}명)</h2>
          {loading ? (
            [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
          ) : (
            <div className="space-y-3">
              {employees.map((emp) => (
                <Card key={emp.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F2F2F7] flex items-center justify-center text-base font-medium text-ios-text">
                        {emp.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-ios-text">{emp.name}</span>
                          {emp.role && <Badge label={ROLES[emp.role].label} color={roleColor[emp.role]} />}
                        </div>
                        <p className="text-sm text-ios-subtext">{emp.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneLink phone={emp.phone} />
                      <select
                        value={emp.role || ''}
                        onChange={(e) => handleRoleChange(emp.id, e.target.value as Role)}
                        className="text-xs bg-[#F2F2F7] rounded-lg px-2 py-1 text-ios-text"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
