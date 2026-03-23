'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { TICKET_TYPES, PRIORITY, EQUIPMENT_TYPES } from '@/lib/constants';
import { parseTicketText } from '@/lib/parse-ticket-text';
import TopBar from '@/components/layout/TopBar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ImageUpload from '@/components/common/ImageUpload';
import StoreSearch from '@/components/store/StoreSearch';
import { Lightning, X } from '@phosphor-icons/react';
import type { Store } from '@/types';

export default function NewTicketPage() {
  const { employee } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showSmartPaste, setShowSmartPaste] = useState(true);
  const [pasteText, setPasteText] = useState('');

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

  const handleSmartPaste = () => {
    if (!pasteText.trim()) return;

    const parsed = parseTicketText(pasteText);

    setForm((prev) => ({
      ...prev,
      store_name: parsed.store_name || prev.store_name,
      store_phone: parsed.store_phone || prev.store_phone,
      store_address: parsed.store_address || prev.store_address,
      title: parsed.title || prev.title,
      description: parsed.description || prev.description,
    }));

    setShowSmartPaste(false);
    setPasteText('');
  };

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

      <div className="px-5 py-6 space-y-5">
        {/* 스마트 붙여넣기 */}
        {showSmartPaste && (
          <Card className="relative border-dashed !border-border">
            <button
              onClick={() => setShowSmartPaste(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface-secondary flex items-center justify-center"
            >
              <X size={14} className="text-text-tertiary" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Lightning size={16} weight="fill" className="text-white" />
              </div>
              <div>
                <p className="text-body font-semibold text-text-primary">스마트 붙여넣기</p>
                <p className="text-micro text-text-tertiary">밴드/메신저 내용을 붙여넣으면 자동 입력</p>
              </div>
            </div>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"밴드에서 복사한 내용을 여기에 붙여넣기\n\n예시:\n엔젤\n전남 여수시 여문1로 46-1\n010-9659-6938\n.\n단말기가 안된다고 하세요"}
              className="w-full min-h-[120px] px-3 py-2.5 bg-surface-secondary rounded-xl text-caption text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none"
            />
            {pasteText.trim() && (
              <Button
                type="button"
                size="sm"
                className="w-full mt-3"
                onClick={handleSmartPaste}
              >
                자동 입력하기
              </Button>
            )}
          </Card>
        )}

        {!showSmartPaste && (
          <button
            onClick={() => setShowSmartPaste(true)}
            className="flex items-center gap-2 text-caption text-text-secondary press-effect"
          >
            <Lightning size={14} weight="fill" />
            스마트 붙여넣기 열기
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 거래처 정보 */}
          <div className="space-y-3">
            <h2 className="text-body font-semibold text-text-primary">거래처 정보</h2>
            <div className="space-y-2">
              <label className="block text-caption font-medium text-text-secondary">거래처 검색</label>
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
            <h2 className="text-body font-semibold text-text-primary">업무 내용</h2>
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
            <h2 className="text-body font-semibold text-text-primary">사진 첨부</h2>
            <ImageUpload
              bucket="ticket-images"
              folder="tickets"
              existingImages={images}
              onUpload={(url) => setImages((prev) => [...prev, url])}
            />
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            접수하기
          </Button>
        </form>
      </div>
    </>
  );
}
