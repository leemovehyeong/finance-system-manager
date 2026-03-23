'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Document {
  name: string;
  url: string;
  type: string;
}

interface DocumentUploadProps {
  bucket: string;
  folder: string;
  documents: Document[];
  onUpload: (doc: Document) => void;
  onRemove?: (index: number) => void;
  readonly?: boolean;
}

export default function DocumentUpload({
  bucket,
  folder,
  documents,
  onUpload,
  onRemove,
  readonly = false,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onUpload({
        name: file.name,
        url: publicUrl,
        type: file.type,
      });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="space-y-3">
      {documents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-5 py-3 ${idx < documents.length - 1 ? 'border-b border-[#F2F2F7]' : ''}`}
            >
              <span className="text-lg">{getFileIcon(doc.type)}</span>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-sm text-[#007AFF] truncate"
              >
                {doc.name}
              </a>
              {!readonly && onRemove && (
                <button
                  onClick={() => onRemove(idx)}
                  className="text-xs text-[#FF3B30] press-effect flex-shrink-0"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readonly && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-[48px] bg-[#F2F2F7] rounded-xl text-sm text-[#007AFF] font-medium press-effect flex items-center justify-center gap-2"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              서류 첨부
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
