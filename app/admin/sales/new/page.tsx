'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { SALES_CHECKLIST_TEMPLATE, INSTALL_CHECKLIST_TEMPLATE } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import StoreSearch from '@/components/store/StoreSearch';
import type { Store } from '@/types';

export default function NewSalesProjectPage() {
  const { employee } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    store_name: '',
    store_phone: '',
    store_address: '',
    owner_name: '',
    business_number: '',
    franchise: '',
    contract_type: '',
    memo: '',
  });

  const [storeId, setStoreId] = useState<string | null>(null);

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStoreSelect = (store: Store) => {
    setStoreId(store.id);
    setForm((prev) => ({
      ...prev,
      store_name: store.name,
      store_phone: store.phone || '',
      store_address: store.address || '',
      owner_name: store.owner_name || '',
      business_number: store.business_number || '',
      franchise: store.franchise || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setLoading(true);

    const { error } = await supabase.from('sales_projects').insert({
      store_id: storeId || null,
      store_name: form.store_name,
      store_phone: form.store_phone || null,
      store_address: form.store_address || null,
      owner_name: form.owner_name || null,
      business_number: form.business_number || null,
      franchise: form.franchise || null,
      contract_type: form.contract_type || null,
      sales_person: employee.id,
      sales_status: 'prospecting',
      sales_checklist: { ...SALES_CHECKLIST_TEMPLATE },
      install_checklist: { ...INSTALL_CHECKLIST_TEMPLATE },
      documents: [],
      memo: form.memo || null,
    });

    if (!error) {
      router.push('/admin/sales');
    }

    setLoading(false);
  };

  const contractOptions = [
    { value: '', label: '선택' },
    { value: 'purchase', label: '매입' },
    { value: 'lease', label: '리스' },
    { value: 'consignment', label: '위탁' },
  ];

  return (
    <>
      <TopBar title="새 영업 프로젝트" showBack />

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-5">
        {/* 거래처 검색 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">거래처</h2>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ios-text">거래처 검색</label>
            <StoreSearch onSelect={handleStoreSelect} placeholder="기존 거래처 검색..." />
          </div>
          <Input
            label="상호명"
            placeholder="상호명"
            value={form.store_name}
            onChange={(e) => updateForm('store_name', e.target.value)}
            required
          />
          <Input
            label="대표자명"
            placeholder="대표자"
            value={form.owner_name}
            onChange={(e) => updateForm('owner_name', e.target.value)}
          />
          <Input
            label="사업자번호"
            placeholder="000-00-00000"
            value={form.business_number}
            onChange={(e) => updateForm('business_number', e.target.value)}
          />
          <Input
            label="전화번호"
            type="tel"
            placeholder="010-0000-0000"
            value={form.store_phone}
            onChange={(e) => updateForm('store_phone', e.target.value)}
          />
          <Input
            label="주소"
            placeholder="주소"
            value={form.store_address}
            onChange={(e) => updateForm('store_address', e.target.value)}
          />
          <Input
            label="프랜차이즈"
            placeholder="프랜차이즈명 (해당 시)"
            value={form.franchise}
            onChange={(e) => updateForm('franchise', e.target.value)}
          />
        </div>

        {/* 계약 정보 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">계약 정보</h2>
          <Select
            label="계약 유형"
            options={contractOptions}
            value={form.contract_type}
            onChange={(e) => updateForm('contract_type', e.target.value)}
            placeholder="선택"
          />
          <Textarea
            label="메모"
            placeholder="특이사항"
            value={form.memo}
            onChange={(e) => updateForm('memo', e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          프로젝트 생성
        </Button>
      </form>
    </>
  );
}
