'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { PAPER_TYPES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import type { PaperStock, PaperTransaction, PaperType } from '@/types';

export default function AdminPaperPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stocks, setStocks] = useState<PaperStock[]>([]);
  const [transactions, setTransactions] = useState<PaperTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    subscribeToStock();
  }, []);

  const fetchData = async () => {
    const { data: stockData } = await supabase
      .from('paper_stock')
      .select('*')
      .order('type');
    setStocks(stockData || []);

    const { data: txData } = await supabase
      .from('paper_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setTransactions(txData || []);

    setLoading(false);
  };

  const subscribeToStock = () => {
    const channel = supabase
      .channel('paper-stock')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'paper_stock' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <>
      <TopBar title="용지 재고" showBack />

      <div className="px-5 py-6 space-y-6">
        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => router.push('/admin/paper/deliver')}
          >
            지급
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={() => router.push('/admin/paper/stock-in')}
          >
            입고
          </Button>
        </div>

        {/* 재고 현황 */}
        <div>
          <h2 className="text-lg font-semibold text-ios-text mb-3">현재 재고</h2>
          <div className="space-y-3">
            {stocks.map((stock) => {
              const config = PAPER_TYPES[stock.type];
              const isLow = stock.quantity <= stock.low_threshold;
              const boxes = Math.floor(stock.quantity / config.boxUnit);
              const remainder = stock.quantity % config.boxUnit;
              const pct = Math.min((stock.quantity / (stock.low_threshold * 3)) * 100, 100);

              return (
                <Card key={stock.id}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-ios-text">{config.label}</h3>
                    {isLow && (
                      <span className="text-xs font-medium text-[#FF3B30] bg-[#FF3B301A] px-2 py-0.5 rounded-full">
                        부족
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-3xl font-bold ${isLow ? 'text-[#FF3B30]' : 'text-ios-text'}`}>
                      {stock.quantity}
                    </span>
                    <span className="text-sm text-ios-subtext">{config.unit}</span>
                  </div>

                  <p className="text-xs text-ios-subtext mb-3">
                    {boxes}박스 {remainder > 0 ? `+ ${remainder}${config.unit}` : ''} (1박스 = {config.boxUnit}{config.unit})
                  </p>

                  {/* 프로그레스 바 */}
                  <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isLow ? '#FF3B30' : pct > 60 ? '#34C759' : '#FF9500',
                      }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 최근 이력 */}
        <div>
          <h2 className="text-lg font-semibold text-ios-text mb-3">최근 이력</h2>
          {transactions.length === 0 ? (
            <Card>
              <p className="text-sm text-ios-subtext text-center py-4">이력이 없습니다</p>
            </Card>
          ) : (
            <Card padding={false}>
              {transactions.map((tx, idx) => {
                const typeLabel = tx.type === 'out' ? '지급' : tx.type === 'in' ? '입고' : '조정';
                const typeColor = tx.type === 'out' ? '#FF3B30' : tx.type === 'in' ? '#34C759' : '#FF9500';
                const paperConfig = PAPER_TYPES[tx.paper_type as PaperType];
                const sign = tx.type === 'out' ? '-' : '+';

                return (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between px-5 py-3 ${idx < transactions.length - 1 ? 'border-b border-[#F2F2F7]' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${typeColor}1A`, color: typeColor }}
                        >
                          {typeLabel}
                        </span>
                        <span className="text-sm text-ios-text font-medium">
                          {paperConfig?.label || tx.paper_type}
                        </span>
                      </div>
                      {tx.store_name && (
                        <p className="text-xs text-ios-subtext mt-0.5">{tx.store_name}</p>
                      )}
                      {tx.memo && (
                        <p className="text-xs text-ios-subtext">{tx.memo}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: typeColor }}>
                        {sign}{tx.quantity}{paperConfig?.unit || ''}
                      </p>
                      <p className="text-xs text-ios-subtext">{formatDate(tx.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
