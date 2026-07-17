import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'border border-accent bg-accent text-onAccent shadow-sm hover:brightness-110',
  secondary: 'border border-borderSoft bg-panel text-textBody shadow-sm hover:border-accent/60 hover:bg-panel2',
  ghost: 'border border-transparent text-textBody hover:bg-panel2 hover:text-textStrong',
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
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
