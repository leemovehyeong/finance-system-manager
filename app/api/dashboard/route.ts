import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { TICKET_STATUS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const role = request.nextUrl.searchParams.get('role');

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 직원 정보
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (!employee) {
    return NextResponse.json({ error: 'employee not found' }, { status: 404 });
  }

  try {
    let data;
    if (role === 'admin') {
      data = await getAdminData(supabase);
    } else if (role === 'office') {
      data = await getOfficeData(supabase);
    } else if (role === 'field') {
      data = await getFieldData(supabase, employee.id);
    } else {
      return NextResponse.json({ error: 'invalid role' }, { status: 400 });
    }
    return NextResponse.json({ ...data, employeeName: employee.name });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

async function getAdminData(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const [ticketsRes, recentRes, employeesRes, stockRes, activeRes] = await Promise.all([
    supabase.from('tickets').select('status'),
    supabase.from('tickets')
      .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('employees')
      .select('*')
      .in('role', ['field', 'admin'])
      .eq('is_active', true),
    supabase.from('paper_stock').select('*'),
    supabase.from('tickets')
      .select('assigned_to')
      .in('status', ['accepted', 'in_progress']),
  ]);

  // 상태별 카운트
  const stats: Record<string, number> = {};
  for (const key of Object.keys(TICKET_STATUS)) {
    stats[key] = 0;
  }
  if (ticketsRes.data) {
    for (const t of ticketsRes.data) {
      if (t.status in stats) stats[t.status]++;
    }
  }

  // 직원별 진행 중 건수
  const countMap: Record<string, number> = {};
  if (activeRes.data) {
    for (const t of activeRes.data) {
      if (t.assigned_to) {
        countMap[t.assigned_to] = (countMap[t.assigned_to] || 0) + 1;
      }
    }
  }
  const fieldEmployees = (employeesRes.data || []).map((emp) => ({
    ...emp,
    activeCount: countMap[emp.id] || 0,
  }));

  return {
    stats,
    recentTickets: recentRes.data || [],
    fieldEmployees,
    paperStock: stockRes.data || [],
  };
}

async function getOfficeData(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const [ticketsRes, statusRes] = await Promise.all([
    supabase.from('tickets')
      .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('tickets').select('status'),
  ]);

  const stats: Record<string, number> = {};
  for (const key of Object.keys(TICKET_STATUS)) {
    stats[key] = 0;
  }
  if (statusRes.data) {
    for (const t of statusRes.data) {
      if (t.status in stats) stats[t.status]++;
    }
  }

  return {
    tickets: ticketsRes.data || [],
    stats,
  };
}

async function getFieldData(supabase: ReturnType<typeof createServerSupabaseClient>, employeeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [tasksRes, pendingRes, completedRes] = await Promise.all([
    supabase.from('tickets')
      .select('*')
      .eq('assigned_to', employeeId)
      .in('status', ['accepted', 'in_progress'])
      .order('accepted_at', { ascending: false }),
    supabase.from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', employeeId)
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString()),
  ]);

  return {
    myTasks: tasksRes.data || [],
    pendingCount: pendingRes.count || 0,
    completedToday: completedRes.count || 0,
  };
}
