'use client';

import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-ios-text">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full h-[48px] px-4 bg-[#F2F2F7] rounded-xl border-none text-ios-text appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-shadow',
            'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M6%208L1%203h10z%22%20fill%3D%22%238E8E93%22%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_16px_center]',
            error && 'ring-2 ring-[#FF3B30]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-[#FF3B30] ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
