'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-caption font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 px-4 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all',
            error && 'border-status-urgent focus:border-status-urgent focus:ring-status-urgent',
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

Input.displayName = 'Input';
export default Input;
