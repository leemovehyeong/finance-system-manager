'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { TICKET_TYPES, PRIORITY, EQUIPMENT_TYPES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/common/ImageUpload';
import StoreSearch from '@/components/store/StoreSearch';
import type { Store } from '@/types';

export default function NewTicketPage() {
  const { employee } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const [form, setForm] = useState({
    store_name: '',
    store_phone: '',
    store_address: '',
    type: 'as',
    priority: 'normal',
    title: '',
    description: '',
    equipment_type: '',
  });

  const handleStoreSelect = (store: Store) => {
    setSelectedStoreId(store.id);
    setForm((prev) => ({
      ...prev,
      store_name: store.name,
      store_phone: store.phone || '',
      store_address: store.address || '',
    }));
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setLoading(true);

    const { error } = await supabase.from('tickets').insert({
      store_id: selectedStoreId || null,
      store_name: form.store_name,
      store_phone: form.store_phone || null,
      store_address: form.store_address || null,
      type: form.type,
      priority: form.priority,
      title: form.title,
      description: form.description || null,
      equipment_type: form.equipment_type || null,
      source: 'internal',
      created_by: employee.id,
      images: images.length > 0 ? images : null,
    });

    if (!error) {
      router.push('/office/dashboard');
    }

    setLoading(false);
  };

  const typeOptions = Object.entries(TICKET_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const priorityOptions = Object.entries(PRIORITY).map(([value, config]) => ({
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

  return (
    <>
      <TopBar title="새 티켓 접수" showBack />

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-5">
        {/* 거래처 정보 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">거래처 정보</h2>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ios-text">거래처 검색</label>
            <StoreSearch onSelect={handleStoreSelect} placeholder="거래처명으로 검색 (자동완성)" />
          </div>
          <Input
            label="거래처명"
            placeholder="거래처명을 입력하세요"
            value={form.store_name}
            onChange={(e) => updateForm('store_name', e.target.value)}
            required
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
            placeholder="주소를 입력하세요"
            value={form.store_address}
            onChange={(e) => updateForm('store_address', e.target.value)}
          />
        </div>

        {/* 티켓 정보 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">업무 내용</h2>
          <Select
            label="유형"
            options={typeOptions}
            value={form.type}
            onChange={(e) => updateForm('type', e.target.value)}
          />
          <Select
            label="우선순위"
            options={priorityOptions}
            value={form.priority}
            onChange={(e) => updateForm('priority', e.target.value)}
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

        {/* 이미지 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">사진 첨부</h2>
          <ImageUpload
            bucket="ticket-images"
            folder="tickets"
            existingImages={images}
            onUpload={(url) => setImages((prev) => [...prev, url])}
          />
        </div>

        {/* 제출 */}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          접수하기
        </Button>
      </form>
    </>
  );
}
