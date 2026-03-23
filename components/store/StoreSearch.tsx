'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import type { Store } from '@/types';

interface StoreSearchProps {
  onSelect: (store: Store) => void;
  placeholder?: string;
}

export default function StoreSearch({ onSelect, placeholder = '거래처 검색...' }: StoreSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Store[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
        .order('last_visit_at', { ascending: false, nullsFirst: false })
        .limit(10);

      setResults(data || []);
      setIsOpen(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full h-[48px] px-4 bg-[#F2F2F7] rounded-xl border-none text-ios-text placeholder:text-ios-subtext focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
      />

      {isOpen && results.length > 0 && (
        <div className="absolute top-[52px] left-0 right-0 bg-white rounded-2xl shadow-card-hover z-50 max-h-[300px] overflow-y-auto">
          {results.map((store) => (
            <button
              key={store.id}
              onClick={() => {
                onSelect(store);
                setQuery(store.name);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left border-b border-[#F2F2F7] last:border-0 press-effect"
            >
              <p className="text-sm font-medium text-ios-text">{store.name}</p>
              {store.address && (
                <p className="text-xs text-ios-subtext mt-0.5">{store.address}</p>
              )}
              {store.phone && (
                <p className="text-xs text-ios-subtext">{store.phone}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
