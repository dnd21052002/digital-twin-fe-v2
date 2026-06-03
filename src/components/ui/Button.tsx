import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-focus',
  secondary: 'border border-hairline bg-surface-1 text-ink hover:bg-surface-2 hover:border-hairline-strong active:bg-surface-3',
  ghost: 'text-ink-muted hover:bg-surface-1 hover:text-ink active:bg-surface-2',
  danger: 'bg-critical text-on-primary hover:bg-critical/90 active:bg-critical/80',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-body-sm',
  md: 'h-9 px-3.5 text-button',
  lg: 'h-10 px-4 text-button',
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  iconOnly?: boolean;
  children: ReactNode;
};

export function Button({ variant = 'secondary', size = 'md', iconOnly, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-40 ${sizes[size]} ${iconOnly ? 'aspect-square px-0' : ''} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
