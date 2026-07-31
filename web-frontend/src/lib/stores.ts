/**
 * Web store — diyet store'unu localStorage backend'i ile kurar.
 *
 * Auth↔Diet bağlama mantığı BURADA DEĞİL: @shared/store/bindAuthToDietStore içinde.
 * Mobil taraf (src/store/stores.ts) aynı fonksiyonu çağırır — mantığı buraya
 * kopyalama, ayrışır.
 */

'use client';

import type { StateStorage } from 'zustand/middleware';
import { createDietStore } from '@shared/store/useDietStore';
import { bindAuthToDietStore } from '@shared/store/bindAuthToDietStore';
import { useAuthStore } from '@shared/store/useAuthStore';
import { useChatStore } from '@shared/store/useChatStore';

// SSR sırasında window yok — tembel sarmalayıcı
const webStorage: StateStorage = {
  getItem: (name: string) =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

export const useDietStore = createDietStore(webStorage);

bindAuthToDietStore(useDietStore);

export { useAuthStore, useChatStore };
