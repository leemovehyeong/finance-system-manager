'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { APP_NAME, TICKET_TYPES, EQUIPMENT_TYPES } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

function RequestFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const storeId = searchParams.get('store');

  const [loading, setLoading] = useState(false);
  const [storeLoading, setStoreLoading] = useState(!!storeId);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    store_name: '',
    store_phone: '',
    store_address: '',
    contact_phone: '',
    type: 'as',
    title: '',
    description: '',
    equipment_type: '',
  });

  // store UUID가 있으면 거래처 정보 자동 채움
  useEffect(() => {
    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  const fetchStore = async () => {
    const { data } = await supabase
      .from('stores')
      .select('name, phone, address')
      .eq('id', storeId)
      .single();

    if (data) {
      setForm((prev) => ({
        ...prev,
        store_name: data.name || '',
        store_phone: data.phone || '',
        store_address: data.address || '',
      }));
    }
    setStoreLoading(false);
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 스팸 방지: 같은 전화번호 10분 내 중복 체크
    if (form.contact_phone) {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('store_phone', form.contact_phone)
        .eq('source', 'external')
        .gte('created_at', tenMinAgo);

      if (count && count > 0) {
        setError('10분 이내에 동일한 번호로 접수된 건이 있습니다. 잠시 후 다시 시도해주세요.');
        setLoading(false);
        return;
      }
    }

    const { error: insertError } = await supabase.from('tickets').insert({
      store_id: storeId || null,
      store_name: form.store_name,
      store_phone: form.contact_phone || form.store_phone || null,
      store_address: form.store_address || null,
      type: form.type,
      title: form.title,
      description: form.description || null,
      equipment_type: form.equipment_type || null,
      source: 'external',
      priority: 'normal',
    });

    if (insertError) {
      setError('접수에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    // 외부 접수 알림
    await supabase.from('notifications').insert({
      type: 'external_ticket',
      title: `🌐 외부접수: ${form.store_name}`,
      body: `${form.store_name} — ${form.title}`,
      target: 'all',
    });

    router.push('/request/complete');
  };

  const typeOptions = Object.entries(TICKET_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const equipmentOptions = [
    { value: '', label: '선택 안함' },
    ...Object.entries(EQUIPMENT_TYPES).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  ];

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-6 pt-12 pb-6 text-center">
        <div className="w-16 h-16 bg-[#007AFF] rounded-[18px] mx-auto mb-4 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-ios-text tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-ios-subtext mt-1">A/S 및 서비스 요청 접수</p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="px-6 pb-12 space-y-5">
        {/* 거래처 정보 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">거래처 정보</h2>
          <Input
            label="상호명"
            placeholder="상호명을 입력하세요"
            value={form.store_name}
            onChange={(e) => updateForm('store_name', e.target.value)}
            required
            disabled={!!storeId && !!form.store_name}
          />
          <Input
            label="연락처"
            type="tel"
            placeholder="연락받으실 전화번호"
            value={form.contact_phone}
            onChange={(e) => updateForm('contact_phone', e.target.value)}
            required
          />
          {!storeId && (
            <Input
              label="주소"
              placeholder="주소 (선택)"
              value={form.store_address}
              onChange={(e) => updateForm('store_address', e.target.value)}
            />
          )}
        </div>

        {/* 요청 내용 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">요청 내용</h2>
          <Select
            label="유형"
            options={typeOptions}
            value={form.type}
            onChange={(e) => updateForm('type', e.target.value)}
          />
          <Select
            label="장비 종류"
            options={equipmentOptions}
            value={form.equipment_type}
            onChange={(e) => updateForm('equipment_type', e.target.value)}
          />
          <Input
            label="제목"
            placeholder="간단한 제목 (예: POS 화면 꺼짐)"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            required
          />
          <Textarea
            label="상세 내용"
            placeholder="증상이나 요청 사항을 자세히 적어주세요"
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-[#FF3B30] text-center">{error}</p>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          접수하기
        </Button>

        <p className="text-xs text-ios-subtext text-center">
          접수 후 담당자가 확인하여 연락드립니다.
        </p>
      </form>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RequestFormContent />
    </Suspense>
  );
}
