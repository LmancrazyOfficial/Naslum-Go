import React from 'react';

export default function NaslumLogo({ size = 'lg', showText = true }) {
  const sizes = {
    sm: { img: 'h-8 w-8', text: 'text-lg' },
    md: { img: 'h-12 w-12', text: 'text-2xl' },
    lg: { img: 'h-20 w-20', text: 'text-4xl' },
    xl: { img: 'h-28 w-28', text: 'text-5xl' },
  };

  const s = sizes[size] || sizes.lg;

  return (
    <div className="flex items-center gap-3">
      {/* SVG logo - no external dependency */}
      <svg
        className={s.img}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="80" height="80" rx="20" fill="hsl(var(--primary))" />
        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="38" fontWeight="800" fontFamily="sans-serif">N</text>
        <circle cx="62" cy="20" r="8" fill="white" opacity="0.9"/>
        <text x="62" y="21" textAnchor="middle" dominantBaseline="middle"
          fill="hsl(var(--primary))" fontSize="10" fontWeight="800" fontFamily="sans-serif">G</text>
      </svg>
      {showText && (
        <span className={`${s.text} font-display font-bold tracking-tight`}>
          <span className="text-foreground">Naslum</span>
          <span className="text-primary"> Go</span>
        </span>
      )}
    </div>
  );
}
