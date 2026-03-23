'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#007AFF] text-white',
      secondary: 'bg-[#F2F2F7] text-[#007AFF]',
      danger: 'bg-[#FF3B30] text-white',
      ghost: 'bg-transparent text-[#007AFF]',
    };

    const sizes = {
      sm: 'h-[36px] px-4 text-sm rounded-lg',
      md: 'h-[44px] px-5 text-base rounded-xl',
      lg: 'h-[52px] px-6 text-base font-semibold rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center press-effect font-medium transition-colors',
          variants[variant],
          sizes[size],
          (disabled || loading) && 'opacity-50 pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
