import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// POST /api/paper-deduct — 용지 티켓 완료 시 자동 차감
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  const body = await request.json();
  const { ticket_id, paper_type, quantity, employee_id, store_name } = body;

  if (!paper_type || !quantity || quantity <= 0) {
    return NextResponse.json({ error: 'paper_type과 quantity 필수' }, { status: 400 });
  }

  // 현재 재고 조회
  const { data: stock } = await supabase
    .from('paper_stock')
    .select('*')
    .eq('type', paper_type)
    .single();

  if (!stock) {
    return NextResponse.json({ error: '용지 유형을 찾을 수 없습니다' }, { status: 404 });
  }

  const newQuantity = Math.max(stock.quantity - quantity, 0);

  // 재고 차감
  await supabase
    .from('paper_stock')
    .update({ quantity: newQuantity })
    .eq('type', paper_type);

  // 거래 이력
  await supabase.from('paper_transactions').insert({
    type: 'out',
    paper_type,
    quantity,
    ticket_id: ticket_id || null,
    employee_id: employee_id || null,
    store_name: store_name || null,
    memo: '티켓 연동 자동 차감',
    prev_stock: stock.quantity,
    new_stock: newQuantity,
  });

  // 부족 알림
  if (newQuantity <= stock.low_threshold) {
    await supabase.from('notifications').insert({
      type: 'low_stock',
      title: `⚠️ 용지 부족`,
      body: `${paper_type} 재고가 ${newQuantity}개입니다. 발주가 필요합니다.`,
      target: 'all',
    });
  }

  return NextResponse.json({ success: true, new_stock: newQuantity });
}
