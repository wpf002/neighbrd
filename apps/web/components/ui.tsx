'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: { variant?: 'primary' | 'ghost' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-ink text-white hover:bg-ink-2',
    ghost: 'border border-line bg-[#f1ede5] text-ink hover:bg-[#e9e4da]',
    danger: 'bg-[#d9534a] text-white hover:bg-[#c2473f]',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  className = '',
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="mb-2.5 block text-[16px] font-medium">{label}</span>}
      <input
        className={`w-full rounded-[11px] border border-line-cool bg-[#fcfbf9] px-4 py-3.5 text-[16px] text-ink outline-none transition placeholder:text-muted-2 focus:border-rust ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = '',
  ...props
}: { label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <span className="mb-2.5 block text-[16px] font-medium">{label}</span>}
      <textarea
        className={`w-full rounded-[11px] border border-line-cool bg-[#fcfbf9] px-4 py-3.5 text-[16px] text-ink outline-none transition placeholder:text-muted-2 focus:border-rust ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  className = '',
  children,
  ...props
}: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <span className="mb-2.5 block text-[16px] font-medium">{label}</span>}
      <select
        className={`w-full appearance-none rounded-[11px] border border-line-cool bg-[#fcfbf9] px-4 py-3.5 text-[16px] text-ink outline-none transition focus:border-rust ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-ink/40 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`mx-auto w-full ${wide ? 'max-w-[720px]' : 'max-w-[520px]'} rounded-card border border-line/70 bg-white p-7 shadow-card`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-[26px] font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-[#f1ede5]">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const init = name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#d98a4f] to-rust font-serif font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {init || '?'}
    </div>
  );
}

/** Gradient relationship-health bar. `value` is 0..100. */
export function HealthBar({ value }: { value: number }) {
  const empty = Math.max(0, Math.min(100, 100 - value));
  return (
    <div className="health-bar" title={`Relationship health ${value}/100`}>
      <span style={{ width: `${empty}%` }} />
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-rust ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="grid place-items-center py-32">
      <Spinner />
    </div>
  );
}
