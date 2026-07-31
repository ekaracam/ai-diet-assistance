'use client';

import React, { useEffect } from 'react';
import { onAuthChange } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setInitialized();
    });

    return () => unsubscribe();
  }, [setUser, setInitialized]);

  return <>{children}</>;
}

