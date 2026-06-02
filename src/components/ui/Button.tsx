import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'border-primary/60 bg-primary text-bg-base hover:bg-primary/90',
  secondary: 'border-border-strong bg-bg-elevated text-text-primary hover:border-primary/60',
  ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
  danger: 'border-critical/60 bg-critical text-white hover:bg-critical/90',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
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
      className={`inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${iconOnly ? 'aspect-square px-0' : ''} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
