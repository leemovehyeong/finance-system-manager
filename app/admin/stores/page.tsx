'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { REGIONS } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import PhoneLink from '@/components/common/PhoneLink';
import type { Store, Region } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchStores();
  }, [search, regionFilter]);

  const fetchStores = async () => {
    let query = supabase
      .from('stores')
      .select('*')
      .order('name');

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    if (regionFilter !== 'all') {
      query = query.eq('region', regionFilter);
    }

    const { data } = await query.limit(100);
    setStores(data || []);
    setLoading(false);
  };

  const filters = [
    { key: 'all' as const, label: '전체' },
    ...REGIONS.map((r) => ({ key: r, label: r })),
  ];

  return (
    <>
      <TopBar
        title="거래처 관리"
        rightAction={
          <Button size="sm" onClick={() => router.push('/admin/stores/new')}>
            + 등록
          </Button>
        }
      />

      <div className="px-5 py-4 space-y-3">
        <Input
          placeholder="거래처명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 지역 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setRegionFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap press-effect transition-colors',
                regionFilter === f.key
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white text-ios-subtext'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3 pb-4">
        {loading ? (
          [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : stores.length === 0 ? (
          <EmptyState icon="🏪" title="거래처가 없습니다" />
        ) : (
          stores.map((store) => (
            <Card
              key={store.id}
              className="press-effect cursor-pointer"
              onClick={() => router.push(`/admin/stores/${store.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-semibold text-ios-text truncate">{store.name}</h3>
                    {store.region && (
                      <span className="px-2 py-0.5 bg-[#F2F2F7] rounded-md text-xs text-ios-subtext flex-shrink-0">
                        {store.region}
                      </span>
                    )}
                  </div>
                  {store.owner_name && (
                    <p className="text-sm text-ios-subtext">{store.owner_name}</p>
                  )}
                  {store.address && (
                    <p className="text-xs text-ios-subtext mt-1 truncate">{store.address}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {store.has_card_terminal && <span className="text-[10px] px-2 py-0.5 bg-[#007AFF1A] text-[#007AFF] rounded-full">단말기</span>}
                    {store.has_pos && <span className="text-[10px] px-2 py-0.5 bg-[#34C7591A] text-[#34C759] rounded-full">POS</span>}
                    {store.has_kiosk && <span className="text-[10px] px-2 py-0.5 bg-[#AF52DE1A] text-[#AF52DE] rounded-full">키오스크</span>}
                    {store.has_table_order && <span className="text-[10px] px-2 py-0.5 bg-[#FF95001A] text-[#FF9500] rounded-full">테이블오더</span>}
                  </div>
                </div>
                <PhoneLink phone={store.phone} />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
