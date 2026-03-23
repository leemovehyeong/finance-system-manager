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
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-ios-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-[48px] px-4 bg-[#F2F2F7] rounded-xl border-none text-ios-text placeholder:text-ios-subtext',
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

Input.displayName = 'Input';
export default Input;
