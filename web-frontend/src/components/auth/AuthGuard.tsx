'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@shared/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user && !isAuthPage) {
      router.replace('/login');
    } else if (user && isAuthPage) {
      router.replace('/');
    }
  }, [user, isInitialized, pathname, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070A]">
        <Loader2 className="w-8 h-8 text-[#00FF87] animate-spin" />
      </div>
    );
  }

  // Prevent flashing of protected content before redirect
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (!user && !isAuthPage) return null;
  if (user && isAuthPage) return null;

  return <>{children}</>;
}
