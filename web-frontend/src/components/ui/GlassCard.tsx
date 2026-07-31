'use client';

import { useRef, useEffect, useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hud?: boolean; // Add HUD corner decorators
  scanline?: boolean; // Add animated scanline
  delay?: number; // Scroll reveal delay in ms
  hover?: boolean; // Enable hover lift
}

export default function GlassCard({
  children,
  className = '',
  hud = false,
  scanline = false,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`
        glass-card p-6
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${hover ? 'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-[rgba(255,255,255,0.15)]' : ''}
        ${hud ? 'hud-corner' : ''}
        ${scanline ? 'hud-scanline' : ''}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
        ${className}
      `}
      style={{
        transitionDelay: isVisible ? '0ms' : `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
