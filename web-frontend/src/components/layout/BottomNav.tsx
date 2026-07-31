'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bot, User, Calendar } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Tablo', icon: LayoutDashboard },
  { href: '/ai', label: 'AI Asistan', icon: Bot },
  { href: '/plan', label: 'Programım', icon: Calendar },
  { href: '/profile', label: 'Profil', icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  // Auth sayfalarında gösterme
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        h-[72px] flex items-center justify-around
        bg-[rgba(13,17,23,0.95)] backdrop-blur-2xl
        border-t border-[rgba(255,255,255,0.06)]
      "
      role="navigation"
      aria-label="Ana navigasyon"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`
              flex flex-col items-center justify-center gap-1
              px-6 py-2 rounded-xl
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isActive
                ? 'text-[#00FF87]'
                : 'text-[#484F58] hover:text-[#8B949E]'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className={`
              p-1.5 rounded-lg transition-all duration-300
              ${isActive ? 'bg-[rgba(0,255,135,0.1)]' : ''}
            `}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[11px] font-semibold tracking-wide ${isActive ? 'text-[#00FF87]' : ''}`}>
              {label}
            </span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00FF87]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
