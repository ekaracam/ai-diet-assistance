'use client';

import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export default function GlassButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
}: GlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Ripple effect
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setTimeout(() => setRipple(null), 600);
    }

    onClick?.();
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: `
      bg-[rgba(0,255,135,0.1)] border border-[rgba(0,255,135,0.3)]
      text-[#00FF87] hover:bg-[rgba(0,255,135,0.2)]
      hover:border-[rgba(0,255,135,0.5)]
      hover:shadow-[0_0_30px_rgba(0,255,135,0.3)]
    `,
    secondary: `
      bg-[rgba(96,239,255,0.08)] border border-[rgba(96,239,255,0.2)]
      text-[#60EFFF] hover:bg-[rgba(96,239,255,0.15)]
      hover:border-[rgba(96,239,255,0.4)]
      hover:shadow-[0_0_30px_rgba(96,239,255,0.2)]
    `,
    ghost: `
      bg-transparent border border-[rgba(255,255,255,0.08)]
      text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)]
      hover:border-[rgba(255,255,255,0.15)]
    `,
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-full font-semibold
        backdrop-blur-[12px] cursor-pointer
        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        hover:scale-[1.04] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        flex items-center justify-center gap-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {/* Ripple Effect */}
      {ripple && (
        <span
          className="absolute rounded-full bg-white/20 animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : icon ? (
        icon
      ) : null}

      <span className="relative z-10">{children}</span>
    </button>
  );
}
