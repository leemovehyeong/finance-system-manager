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

export default function PaperStockInPage() {
  const { employee } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [stocks, setStocks] = useState<PaperStock[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    paper_type: 'pos',
    boxes: '',
    extra: '',
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

    const config = PAPER_TYPES[form.paper_type as PaperType];
    const boxCount = parseInt(form.boxes) || 0;
    const extraCount = parseInt(form.extra) || 0;
    const totalQty = (boxCount * config.boxUnit) + extraCount;

    if (totalQty <= 0) return;

    setLoading(true);

    const stock = stocks.find((s) => s.type === form.paper_type);
    if (!stock) {
      setLoading(false);
      return;
    }

    const newQuantity = stock.quantity + totalQty;

    // 재고 증가
    await supabase
      .from('paper_stock')
      .update({ quantity: newQuantity })
      .eq('type', form.paper_type);

    // 거래 이력
    await supabase.from('paper_transactions').insert({
      type: 'in',
      paper_type: form.paper_type,
      quantity: totalQty,
      boxes: boxCount || null,
      employee_id: employee.id,
      memo: form.memo || null,
      prev_stock: stock.quantity,
      new_stock: newQuantity,
    });

    router.push('/admin/paper');
  };

  const paperOptions = Object.entries(PAPER_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const currentStock = stocks.find((s) => s.type === form.paper_type);
  const config = PAPER_TYPES[form.paper_type as PaperType];
  const boxCount = parseInt(form.boxes) || 0;
  const extraCount = parseInt(form.extra) || 0;
  const totalPreview = (boxCount * config.boxUnit) + extraCount;

  return (
    <>
      <TopBar title="용지 입고" showBack />

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
              현재 재고: <span className="font-semibold text-ios-text">{currentStock.quantity}{config.unit}</span>
            </p>
          </Card>
        )}

        <Input
          label={`박스 수 (1박스 = ${config.boxUnit}${config.unit})`}
          type="number"
          placeholder="박스 수"
          value={form.boxes}
          onChange={(e) => setForm((p) => ({ ...p, boxes: e.target.value }))}
        />

        <Input
          label={`낱개 추가 (${config.unit})`}
          type="number"
          placeholder="낱개 수량 (선택)"
          value={form.extra}
          onChange={(e) => setForm((p) => ({ ...p, extra: e.target.value }))}
        />

        {totalPreview > 0 && (
          <Card className="bg-[#34C7591A]">
            <p className="text-sm text-[#34C759] font-medium text-center">
              총 입고: {totalPreview}{config.unit}
              {currentStock && ` → 재고 ${currentStock.quantity + totalPreview}${config.unit}`}
            </p>
          </Card>
        )}

        <Textarea
          label="메모"
          placeholder="발주처, 비고 등 (선택)"
          value={form.memo}
          onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
        />

        <Button type="submit" size="lg" loading={loading} className="w-full">
          입고 처리
        </Button>
      </form>
    </>
  );
}
