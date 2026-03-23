'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-ios-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[120px] px-4 py-3 bg-[#F2F2F7] rounded-xl border-none text-ios-text placeholder:text-ios-subtext resize-none',
            'focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-shadow',
            error && 'ring-2 ring-[#FF3B30]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#FF3B30] ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
