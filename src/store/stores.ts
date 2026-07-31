/**
 * Mobil store — diyet store'unu AsyncStorage backend'i ile kurar.
 *
 * Auth↔Diet bağlama mantığı BURADA DEĞİL: @shared/store/bindAuthToDietStore içinde.
 * Web tarafı (web-frontend/src/lib/stores.ts) aynı fonksiyonu çağırır — mantığı
 * buraya kopyalama, ayrışır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';
import { createDietStore } from '@shared/store/useDietStore';
import { bindAuthToDietStore } from '@shared/store/bindAuthToDietStore';
import { useAuthStore } from '@shared/store/useAuthStore';
import { useChatStore } from '@shared/store/useChatStore';

// Zustand persist için AsyncStorage adaptörü
const asyncStorageAdapter: StateStorage = {
  getItem: async (name: string) => (await AsyncStorage.getItem(name)) ?? null,
  setItem: async (name: string, value: string) => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useDietStore = createDietStore(asyncStorageAdapter);

bindAuthToDietStore(useDietStore);

export { useAuthStore, useChatStore };
