'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { loadKakaoMapScript, addressToCoords } from '@/lib/kakao-map';
import { REGIONS } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import TicketCard from '@/components/ticket/TicketCard';
import PhoneLink from '@/components/common/PhoneLink';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import QRGenerator from '@/components/common/QRGenerator';
import type { Store, Ticket, Region } from '@/types';

export default function StoreDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [store, setStore] = useState<Store | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coordsLoading, setCoordsLoading] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Store>>({});

  useEffect(() => {
    fetchStore();
    fetchTickets();
  }, [params.id]);

  const fetchStore = async () => {
    try {
      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('id', params.id)
        .single();

      setStore(data);
      setEditForm(data || {});
    } catch (err) {
      console.error('Store fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
        .eq('store_id', params.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setTickets(data || []);
    } catch (err) {
      console.error('Store tickets fetch error:', err);
    }
  };

  const handleAddressConvert = async () => {
    if (!editForm.address) return;
    setCoordsLoading(true);

    try {
      await loadKakaoMapScript();
      const result = await addressToCoords(editForm.address);
      if (result) {
        setEditForm((prev) => ({
          ...prev,
          latitude: result.lat,
          longitude: result.lng,
        }));
      } else {
        alert('주소를 찾을 수 없습니다.');
      }
    } catch {
      alert('카카오맵 키가 설정되지 않았습니다.');
    }

    setCoordsLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('stores')
      .update({
        name: editForm.name,
        business_number: editForm.business_number || null,
        owner_name: editForm.owner_name || null,
        phone: editForm.phone || null,
        address: editForm.address || null,
        latitude: editForm.latitude || null,
        longitude: editForm.longitude || null,
        region: editForm.region || null,
        franchise: editForm.franchise || null,
        van_type: editForm.van_type || null,
        memo: editForm.memo || null,
        has_card_terminal: editForm.has_card_terminal,
        has_pos: editForm.has_pos,
        has_kiosk: editForm.has_kiosk,
        has_table_order: editForm.has_table_order,
        terminal_count: editForm.terminal_count,
        pos_count: editForm.pos_count,
      })
      .eq('id', params.id);

    if (!error) {
      setEditing(false);
      fetchStore();
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!store) {
    return (
      <>
        <TopBar title="거래처 상세" showBack />
        <EmptyState icon="store" title="거래처를 찾을 수 없습니다" />
      </>
    );
  }

  const regionOptions = REGIONS.map((r) => ({ value: r, label: r }));

  return (
    <>
      <TopBar
        title={store.name}
        showBack
        rightAction={
          !editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-[#007AFF] font-medium press-effect"
            >
              수정
            </button>
          ) : (
            <button
              onClick={() => { setEditing(false); setEditForm(store); }}
              className="text-sm text-[#FF3B30] font-medium press-effect"
            >
              취소
            </button>
          )
        }
      />

      <div className="px-5 py-6 space-y-5">
        {editing ? (
          /* 수정 모드 */
          <div className="space-y-4">
            <Input
              label="거래처명"
              value={editForm.name || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label="사업자번호"
              value={editForm.business_number || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, business_number: e.target.value }))}
            />
            <Input
              label="대표자명"
              value={editForm.owner_name || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, owner_name: e.target.value }))}
            />
            <Input
              label="전화번호"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="주소"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="secondary" size="md" onClick={handleAddressConvert} loading={coordsLoading}>
                  좌표변환
                </Button>
              </div>
            </div>
            {editForm.latitude && (
              <p className="text-xs text-[#34C759] ml-1">
                좌표: {editForm.latitude.toFixed(4)}, {editForm.longitude?.toFixed(4)}
              </p>
            )}
            <Select
              label="지역"
              options={regionOptions}
              value={editForm.region || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, region: e.target.value as Region }))}
              placeholder="지역 선택"
            />
            <Input
              label="프랜차이즈"
              value={editForm.franchise || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, franchise: e.target.value }))}
            />
            <Input
              label="VAN사"
              value={editForm.van_type || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, van_type: e.target.value }))}
            />
            <Textarea
              label="메모"
              value={editForm.memo || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, memo: e.target.value }))}
            />
            <Button size="lg" className="w-full" onClick={handleSave} loading={saving}>
              저장
            </Button>
          </div>
        ) : (
          /* 보기 모드 */
          <>
            <Card>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ios-subtext">거래처명</span>
                  <span className="text-ios-text font-medium">{store.name}</span>
                </div>
                {store.owner_name && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">대표자</span>
                    <span className="text-ios-text">{store.owner_name}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">전화</span>
                    <PhoneLink phone={store.phone} />
                  </div>
                )}
                {store.business_number && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">사업자번호</span>
                    <span className="text-ios-text">{store.business_number}</span>
                  </div>
                )}
                {store.address && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">주소</span>
                    <span className="text-ios-text text-right max-w-[60%]">{store.address}</span>
                  </div>
                )}
                {store.region && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">지역</span>
                    <span className="text-ios-text">{store.region}</span>
                  </div>
                )}
                {store.franchise && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">프랜차이즈</span>
                    <span className="text-ios-text">{store.franchise}</span>
                  </div>
                )}
                {store.van_type && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">VAN사</span>
                    <span className="text-ios-text">{store.van_type}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ios-subtext">방문 횟수</span>
                  <span className="text-ios-text">{store.visit_count}회</span>
                </div>
                {store.contract_date && (
                  <div className="flex justify-between">
                    <span className="text-ios-subtext">계약일</span>
                    <span className="text-ios-text">{formatDate(store.contract_date)}</span>
                  </div>
                )}
              </div>

              {/* 장비 뱃지 */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {store.has_card_terminal && <span className="text-xs px-2 py-0.5 bg-[#007AFF1A] text-[#007AFF] rounded-full">단말기</span>}
                {store.has_pos && <span className="text-xs px-2 py-0.5 bg-[#34C7591A] text-[#34C759] rounded-full">POS</span>}
                {store.has_kiosk && <span className="text-xs px-2 py-0.5 bg-[#AF52DE1A] text-[#AF52DE] rounded-full">키오스크</span>}
                {store.has_table_order && <span className="text-xs px-2 py-0.5 bg-[#FF95001A] text-[#FF9500] rounded-full">테이블오더</span>}
              </div>

              {store.memo && (
                <div className="mt-4 pt-3 border-t border-[#F2F2F7]">
                  <p className="text-xs text-ios-subtext mb-1">메모</p>
                  <p className="text-sm text-ios-text">{store.memo}</p>
                </div>
              )}
            </Card>

            {/* QR 코드 */}
            <div>
              <h2 className="text-lg font-semibold text-ios-text mb-3">외부 접수 QR</h2>
              <QRGenerator
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/request?store=${params.id}`}
                storeName={store.name}
              />
            </div>

            {/* 방문 이력 (티켓) */}
            <div>
              <h2 className="text-lg font-semibold text-ios-text mb-3">
                방문 이력 ({tickets.length})
              </h2>
              {tickets.length === 0 ? (
                <EmptyState icon="clipboard" title="방문 이력이 없습니다" />
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} basePath="/admin" />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
