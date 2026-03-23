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
      <div className="space-y-2">
        {label && (
          <label className="block text-caption font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[120px] px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-tertiary resize-none',
            'focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all',
            error && 'border-status-urgent',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-micro text-status-urgent ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
