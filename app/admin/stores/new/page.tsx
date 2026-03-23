'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { loadKakaoMapScript, addressToCoords } from '@/lib/kakao-map';
import { REGIONS } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function NewStorePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [coordsLoading, setCoordsLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    business_number: '',
    owner_name: '',
    phone: '',
    address: '',
    region: '',
    franchise: '',
    van_type: '',
    memo: '',
    has_card_terminal: false,
    has_pos: false,
    has_kiosk: false,
    has_table_order: false,
    terminal_count: 0,
    pos_count: 0,
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const updateForm = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddressConvert = async () => {
    if (!form.address.trim()) return;
    setCoordsLoading(true);

    try {
      await loadKakaoMapScript();
      const result = await addressToCoords(form.address);
      if (result) {
        setCoords(result);
      } else {
        alert('주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.');
      }
    } catch {
      alert('카카오맵 키가 설정되지 않았습니다.');
    }

    setCoordsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('stores').insert({
      name: form.name,
      business_number: form.business_number || null,
      owner_name: form.owner_name || null,
      phone: form.phone || null,
      address: form.address || null,
      latitude: coords?.lat || null,
      longitude: coords?.lng || null,
      region: form.region || null,
      franchise: form.franchise || null,
      van_type: form.van_type || null,
      memo: form.memo || null,
      has_card_terminal: form.has_card_terminal,
      has_pos: form.has_pos,
      has_kiosk: form.has_kiosk,
      has_table_order: form.has_table_order,
      terminal_count: form.terminal_count,
      pos_count: form.pos_count,
    });

    if (!error) {
      router.push('/admin/stores');
    } else {
      alert('저장 실패: ' + error.message);
    }

    setLoading(false);
  };

  const regionOptions = REGIONS.map((r) => ({ value: r, label: r }));

  return (
    <>
      <TopBar title="거래처 등록" showBack />

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-5">
        {/* 기본 정보 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">기본 정보</h2>
          <Input
            label="거래처명"
            placeholder="상호명"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            required
          />
          <Input
            label="사업자번호"
            placeholder="000-00-00000"
            value={form.business_number}
            onChange={(e) => updateForm('business_number', e.target.value)}
          />
          <Input
            label="대표자명"
            placeholder="대표자"
            value={form.owner_name}
            onChange={(e) => updateForm('owner_name', e.target.value)}
          />
          <Input
            label="전화번호"
            type="tel"
            placeholder="010-0000-0000"
            value={form.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
          />
        </div>

        {/* 주소 + 좌표 변환 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">위치</h2>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="주소"
                placeholder="예: 여수시 문수동 123-4"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleAddressConvert}
                loading={coordsLoading}
              >
                좌표변환
              </Button>
            </div>
          </div>
          {coords && (
            <p className="text-xs text-[#34C759] ml-1">
              좌표 변환 완료 ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
            </p>
          )}
          <Select
            label="지역"
            options={regionOptions}
            value={form.region}
            onChange={(e) => updateForm('region', e.target.value)}
            placeholder="지역 선택"
          />
        </div>

        {/* 장비 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">장비 현황</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'has_card_terminal', label: '카드단말기' },
              { key: 'has_pos', label: 'POS' },
              { key: 'has_kiosk', label: '키오스크' },
              { key: 'has_table_order', label: '테이블오더' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 bg-[#F2F2F7] rounded-xl px-4 py-3 press-effect cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => updateForm(key, e.target.checked)}
                  className="w-5 h-5 rounded accent-[#007AFF]"
                />
                <span className="text-sm text-ios-text">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 기타 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-ios-text">기타</h2>
          <Input
            label="프랜차이즈"
            placeholder="프랜차이즈명 (해당 시)"
            value={form.franchise}
            onChange={(e) => updateForm('franchise', e.target.value)}
          />
          <Input
            label="VAN사"
            placeholder="VAN사명"
            value={form.van_type}
            onChange={(e) => updateForm('van_type', e.target.value)}
          />
          <Textarea
            label="메모"
            placeholder="특이사항"
            value={form.memo}
            onChange={(e) => updateForm('memo', e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          등록하기
        </Button>
      </form>
    </>
  );
}
