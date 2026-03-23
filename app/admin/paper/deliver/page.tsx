'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { PAPER_TYPES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { PaperStock, PaperType } from '@/types';

export default function PaperDeliverPage() {
  const { employee } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [stocks, setStocks] = useState<PaperStock[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    paper_type: 'pos',
    quantity: '',
    store_name: '',
    memo: '',
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    const { data } = await supabase.from('paper_stock').select('*');
    setStocks(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    const qty = parseInt(form.quantity);
    if (!qty || qty <= 0) return;

    setLoading(true);

    const stock = stocks.find((s) => s.type === form.paper_type);
    if (!stock) {
      setLoading(false);
      return;
    }

    if (qty > stock.quantity) {
      alert('재고가 부족합니다.');
      setLoading(false);
      return;
    }

    const newQuantity = stock.quantity - qty;
    const config = PAPER_TYPES[form.paper_type as PaperType];

    // 재고 차감
    await supabase
      .from('paper_stock')
      .update({ quantity: newQuantity })
      .eq('type', form.paper_type);

    // 거래 이력
    await supabase.from('paper_transactions').insert({
      type: 'out',
      paper_type: form.paper_type,
      quantity: qty,
      boxes: Math.floor(qty / config.boxUnit) || null,
      store_name: form.store_name || null,
      employee_id: employee.id,
      memo: form.memo || null,
      prev_stock: stock.quantity,
      new_stock: newQuantity,
    });

    // 부족 알림
    if (newQuantity <= stock.low_threshold) {
      await supabase.from('notifications').insert({
        type: 'low_stock',
        title: `⚠️ ${config.label} 부족`,
        body: `${config.label} 재고가 ${newQuantity}${config.unit}입니다. 발주가 필요합니다.`,
        target: 'all',
      });
    }

    router.push('/admin/paper');
  };

  const paperOptions = Object.entries(PAPER_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const currentStock = stocks.find((s) => s.type === form.paper_type);

  return (
    <>
      <TopBar title="용지 지급" showBack />

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-5">
        <Select
          label="용지 종류"
          options={paperOptions}
          value={form.paper_type}
          onChange={(e) => setForm((p) => ({ ...p, paper_type: e.target.value }))}
        />

        {currentStock && (
          <Card className="bg-[#F2F2F7]">
            <p className="text-sm text-ios-subtext">
              현재 재고: <span className="font-semibold text-ios-text">{currentStock.quantity}{PAPER_TYPES[currentStock.type].unit}</span>
            </p>
          </Card>
        )}

        <Input
          label="지급 수량"
          type="number"
          placeholder="수량 입력"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          required
        />

        <Input
          label="거래처명"
          placeholder="지급 거래처 (선택)"
          value={form.store_name}
          onChange={(e) => setForm((p) => ({ ...p, store_name: e.target.value }))}
        />

        <Textarea
          label="메모"
          placeholder="비고 (선택)"
          value={form.memo}
          onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
        />

        <Button type="submit" size="lg" variant="danger" loading={loading} className="w-full">
          지급 처리
        </Button>
      </form>
    </>
  );
}
