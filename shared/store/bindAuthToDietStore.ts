/**
 * Auth ↔ Diet store köprüsü — TEK KAYNAK
 *
 * Bu mantık daha önce src/store/stores.ts ve web-frontend/src/lib/stores.ts içinde
 * iki ayrı kopya halindeydi ve ayrışmıştı: web çıkışta kalıcı depoyu temizliyordu,
 * mobil temizlemiyordu. Sonuç: ortak kullanılan telefonda önceki kullanıcının kilo,
 * plan ve geçmiş verisi bir sonraki kullanıcıya görünüyordu.
 *
 * Platform dosyaları artık yalnızca storage backend'ini verip bunu çağırır.
 */

import { useAuthStore } from './useAuthStore';
import type { createDietStore } from './useDietStore';

type DietStore = ReturnType<typeof createDietStore>;

/**
 * Auth durumunu diyet store'una bağlar ve aboneliği iade eder.
 *
 * - Giriş yapıldı        → (varsa önceki kullanıcı temizlenir) profil Firestore'dan yüklenir
 * - Farklı kullanıcı     → önce sıfırla, sonra yükle
 * - Çıkış yapıldı        → state sıfırlanır **ve kalıcı depo silinir**
 */
export const bindAuthToDietStore = (useDietStore: DietStore): (() => void) => {
  // Uygulama açılışında oturum zaten açıksa verileri hemen yükle
  const initial = useAuthStore.getState();
  if (initial.user) {
    void useDietStore.getState().loadUserDataFromFirestore(initial.user.uid);
  }

  return useAuthStore.subscribe((state, prevState) => {
    const uid = state.user?.uid ?? null;
    const prevUid = prevState?.user?.uid ?? null;

    if (uid === prevUid) return;

    if (uid) {
      // Farklı bir kullanıcıdan geçiliyorsa önceki verinin sızmaması için sıfırla
      if (prevUid) {
        useDietStore.getState().resetStore();
        void useDietStore.persist.clearStorage();
      }
      void useDietStore.getState().loadUserDataFromFirestore(uid);
      return;
    }

    // Çıkış: bellekteki state'i sıfırla VE kalıcı kopyayı sil.
    // clearStorage() olmadan zustand/persist bir sonraki açılışta eski veriyi geri yükler.
    useDietStore.getState().resetStore();
    void useDietStore.persist.clearStorage();
  });
};
