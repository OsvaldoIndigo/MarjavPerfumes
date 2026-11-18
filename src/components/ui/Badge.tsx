import type { ReactNode } from 'react';

type BadgeVariant = 'neutral' | 'champagne' | 'dark' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-sand/80 text-obsidian border-hairline',
  champagne: 'bg-champagne/15 text-champagne-dark border-champagne/40',
  dark: 'bg-obsidian text-ivory border-obsidian',
  muted: 'bg-transparent text-stone border-hairline',
};

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] uppercase tracking-[0.12em] font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}