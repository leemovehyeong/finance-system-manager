import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// GET /api/reminders — 설치 D-1 리마인더 생성
// Vercel Cron Job으로 매일 오전 8시 실행 가능
export async function GET() {
  const supabase = createServerSupabaseClient();

  // 내일 날짜
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // 내일 설치 예정인 프로젝트 조회
  const { data: projects } = await supabase
    .from('sales_projects')
    .select('*')
    .eq('install_date', tomorrowStr)
    .in('sales_status', ['install_scheduled', 'installing']);

  if (!projects || projects.length === 0) {
    return NextResponse.json({ message: 'No reminders needed', count: 0 });
  }

  // 각 프로젝트에 대해 리마인더 알림 생성
  const notifications = projects.map((project) => ({
    type: 'install_reminder' as const,
    title: `내일 설치: ${project.store_name}`,
    body: `${project.store_name} 설치가 내일(${tomorrowStr}) 예정되어 있습니다.`,
    target: project.installer || 'all',
    related_sales_id: project.id,
  }));

  const { error } = await supabase.from('notifications').insert(notifications);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Reminders created', count: notifications.length });
}
