'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface ImageUploadProps {
  bucket: string;
  folder: string;
  onUpload: (url: string) => void;
  maxFiles?: number;
  existingImages?: string[];
}

export default function ImageUpload({
  bucket,
  folder,
  onUpload,
  maxFiles = 5,
  existingImages = [],
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        onUpload(publicUrl);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {existingImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {existingImages.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`첨부 ${i + 1}`}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}

      {existingImages.length < maxFiles && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center w-20 h-20 rounded-xl bg-[#F2F2F7] press-effect"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
