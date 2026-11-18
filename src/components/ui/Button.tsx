import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'champagne' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-obsidian text-ivory hover:bg-obsidian/90 border border-obsidian',
  secondary:
    'bg-transparent text-obsidian border border-obsidian/25 hover:border-obsidian hover:bg-sand/60',
  champagne:
    'bg-champagne text-obsidian font-medium hover:bg-champagne/90 border border-champagne',
  ghost:
    'bg-transparent text-obsidian/80 hover:text-obsidian hover:bg-sand/70 border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-xs tracking-[0.12em]',
  md: 'px-5 py-2.5 text-xs tracking-[0.14em]',
  lg: 'px-7 py-3.5 text-xs sm:text-sm tracking-[0.16em]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 uppercase font-medium transition-all duration-200 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}