'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import PhoneLink from '@/components/common/PhoneLink';
import type { Store } from '@/types';

export default function OfficeStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchStores();
  }, [search]);

  const fetchStores = async () => {
    let query = supabase
      .from('stores')
      .select('*')
      .order('name');

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data } = await query.limit(50);
    setStores(data || []);
    setLoading(false);
  };

  return (
    <>
      <TopBar title="거래처" />

      <div className="px-5 py-4">
        <Input
          placeholder="거래처명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="px-5 space-y-3 pb-4">
        {loading ? (
          [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : stores.length === 0 ? (
          <EmptyState icon="store" title="거래처가 없습니다" />
        ) : (
          stores.map((store) => (
            <Card key={store.id} className="press-effect">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-ios-text">{store.name}</h3>
                  {store.owner_name && (
                    <p className="text-sm text-ios-subtext mt-0.5">{store.owner_name}</p>
                  )}
                  {store.address && (
                    <p className="text-xs text-ios-subtext mt-1">{store.address}</p>
                  )}
                </div>
                <PhoneLink phone={store.phone} />
              </div>
              {store.region && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#F2F2F7] rounded-md text-xs text-ios-subtext">
                  {store.region}
                </span>
              )}
            </Card>
          ))
        )}
      </div>
    </>
  );
}
