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
      primary: 'bg-black text-white hover:bg-neutral-800',
      secondary: 'bg-surface-secondary text-text-primary border border-border',
      danger: 'bg-status-urgent text-white',
      ghost: 'bg-transparent text-text-secondary hover:bg-surface-secondary',
    };

    const sizes = {
      sm: 'h-9 px-4 text-caption rounded-full',
      md: 'h-11 px-5 text-body rounded-full',
      lg: 'h-12 px-6 text-body font-semibold rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center press-effect font-medium transition-all',
          variants[variant],
          sizes[size],
          (disabled || loading) && 'opacity-40 pointer-events-none',
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
