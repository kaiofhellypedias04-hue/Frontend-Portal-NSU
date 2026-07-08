import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-950/40',
  secondary: 'border border-borderSoft bg-panel2 text-slate-100 hover:border-sky-400/60 hover:bg-slate-800',
  ghost: 'text-textSoft hover:bg-slate-800/70 hover:text-white',
  danger: 'bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-950/30',
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
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
