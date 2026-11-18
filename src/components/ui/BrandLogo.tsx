interface BrandLogoProps {
  variant?: 'light' | 'dark';
  layout?: 'horizontal' | 'stacked';
  showMonogram?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = 'light',
  layout = 'horizontal',
  showMonogram = true,
  className = '',
}: BrandLogoProps) {
  const isDark = variant === 'dark';

  // Colores fieles a la identidad oficial MARJAV PERFUMES
  const monogramStroke = isDark ? '#C8A27C' : '#A8825C';
  const titleColor = isDark ? 'text-champagne' : 'text-obsidian';
  const subtitleColor = isDark ? 'text-champagne/80' : 'text-stone';

  return (
    <div
      className={`inline-flex items-center select-none ${
        layout === 'stacked' ? 'flex-col text-center gap-2.5' : 'flex-row gap-3'
      } ${className}`}
      aria-label="MARJAV PERFUMES"
    >
      {showMonogram && (
        <svg
          viewBox="0 0 80 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={layout === 'stacked' ? 'h-14 w-auto' : 'h-9 w-auto'}
          aria-hidden="true"
        >
          {/* Trazo exterior estilo doble línea inspirado en el monograma MJ */}
          <path
            d="M14 64V16L40 48L66 16V60C66 71 58 77 48 77C40 77 35 72 35 65C35 59 39 55 44 55"
            stroke={monogramStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Trazo interior paralelo para el acabado grabado de joyería */}
          <path
            d="M19 64V24L40 50L61 24V60C61 68 55 72 48 72C43 72 40 69 40 65C40 62 42 60 44 60"
            stroke={monogramStroke}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Remates serif superiores e inferiores */}
          <line x1="10" y1="16" x2="21" y2="16" stroke={monogramStroke} strokeWidth="1.8" />
          <line x1="59" y1="16" x2="70" y2="16" stroke={monogramStroke} strokeWidth="1.8" />
          <line x1="10" y1="64" x2="23" y2="64" stroke={monogramStroke} strokeWidth="1.8" />
        </svg>
      )}

      <div className="flex flex-col leading-none">
        <span
          className={`font-brand font-medium tracking-[0.26em] ${
            layout === 'stacked' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
          } ${titleColor}`}
        >
          MARJAV
        </span>
        <span
          className={`font-brand tracking-[0.42em] mt-1 ${
            layout === 'stacked' ? 'text-[10px]' : 'text-[8px]'
          } ${subtitleColor}`}
        >
          PERFUMES
        </span>
      </div>
    </div>
  );
}