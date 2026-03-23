'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ROLES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PhoneLink from '@/components/common/PhoneLink';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import type { Employee, Role } from '@/types';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('role')
      .order('name');

    setEmployees(data || []);
    setLoading(false);
  };

  const roleColor: Record<Role, string> = {
    admin: '#FF3B30',
    office: '#007AFF',
    field: '#34C759',
  };

  return (
    <>
      <TopBar title="직원 관리" />

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : (
          employees.map((emp) => (
            <Card key={emp.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F2F2F7] flex items-center justify-center text-base font-medium text-ios-text">
                    {emp.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-ios-text">{emp.name}</span>
                      <Badge label={ROLES[emp.role].label} color={roleColor[emp.role]} />
                    </div>
                    <p className="text-sm text-ios-subtext">{emp.email}</p>
                  </div>
                </div>
                <PhoneLink phone={emp.phone} />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
