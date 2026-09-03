import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'border border-primary bg-primary text-white shadow-sm hover:border-primary-hover hover:bg-primary-hover',
  secondary: 'border border-border bg-surface-elevated text-text-primary shadow-sm hover:border-primary/50 hover:bg-surface-muted',
  ghost: 'border border-transparent text-text-primary hover:bg-surface-muted hover:text-text-primary',
  danger: 'border border-danger bg-danger text-white shadow-sm hover:brightness-110',
};

export function Button({
  children,
  className,
  variant = 'secondary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      className={classNames(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
