# AI Diyet Asistanı — Proje Analiz Raporu

**Tarih:** 2026-07-31
**Kapsam:** `App.tsx`, `src/`, `shared/`, `web-frontend/`, build & git yapılandırması
**Durum:** Her iki taraf da `tsc --noEmit` temiz geçiyor. Aşağıdaki bulgular derleyicinin yakalamadığı sorunlardır.

> **Uygulama notu (aynı gün):** Bölüm 8'de listelenen düzeltmeler yapıldı ve
> doğrulandı. Aşağıdaki bulgu metinleri, sorunun ne olduğunu ve neden bir daha
> yapılmaması gerektiğini anlatmak için **olduğu gibi bırakıldı**. Hâlâ açık olan
> maddeler bölüm 8'in sonundaki listede.

---

## 0. Mimarinin Özeti (doğru anlaşılması için)

```
shared/          ← platform-agnostik çekirdek (types, store factory, services, theme)
  store/useDietStore.ts   → createDietStore(storage) factory
src/             ← Expo / React Native (StyleSheet + React Navigation)
  store/stores.ts         → factory'yi AsyncStorage ile kurar
web-frontend/    ← Next.js 16 + Turbopack (Tailwind v4)
  src/lib/stores.ts       → factory'yi localStorage ile kurar
  src/app/api/gemini/route.ts → TEK Gemini çıkışı (server-side)
```

`@shared` alias'ı üç yerde ayrı ayrı tanımlı: `tsconfig.json` (paths), `babel.config.js`
(module-resolver), `metro.config.js` (extraNodeModules), `web-frontend/next.config.ts`
(turbopack.resolveAlias). **Birini değiştirirken dördünü birden kontrol et.**

---

## 1. KRİTİK — Güvenlik

### 1.1 Depoda düz metin Gemini API anahtarı
`scratch_gemini_test.ts:1` içinde canlı bir API anahtarı sabit yazılmış. Dosya
`.gitignore`'da değil ve git'te takipsiz (`??`) — bir `git add .` anahtarı geçmişe
kalıcı olarak yazar.

**Yapılacak:** anahtarı Google AI Studio'dan iptal et → dosyayı sil → yeni anahtarı
yalnız `.env` içine koy.

### 1.2 Firestore güvenlik kuralları depoda yok
`firestore.rules`, `firebase.json`, `.firebaserc` yok. Kullanıcıların kilo, boy, yağ
oranı, sohbet geçmişi gibi sağlık verileri Firestore'da tutuluyor ama erişim kuralları
sürüm kontrolünde değil — muhtemelen konsolda "test mode" (herkes okur/yazar).

**Yapılacak:** `users/{uid}` altına `request.auth.uid == uid` kuralı yaz, depoya ekle.

### 1.3 224 MB'lık APK takipsiz ve ignore edilmemiş
`AI-Diyet-Test.apk` (224 MB) kök dizinde, `.gitignore`'da yok. GitHub tek dosya limiti
100 MB — bir `git add .` push'u kalıcı olarak bozar.

**Yapılacak:** `.gitignore`'a `*.apk`, `*.aab` ekle.

---

## 2. KRİTİK — Fonksiyonel

### 2.1 Derlenmiş APK'da tüm AI özellikleri ölü
`shared/services/geminiService.ts:11-23` — `EXPO_PUBLIC_API_URL` tanımlı değilse
`http://localhost:3000` adresine düşüyor. `.env` içinde bu değişken **yok**. Yani
telefona kurulan APK'da `localhost` = telefonun kendisi → diyet planı, sohbet,
alternatif yemek, hepsi hata veriyor. Üstelik Android release build'lerinde cleartext
HTTP varsayılan olarak bloklu.

**Yapılacak:** Next.js API route'unu bir yere deploy et (Vercel), `.env`'e
`EXPO_PUBLIC_API_URL=https://...` yaz. Fallback'i `localhost` yerine "yapılandırılmamış"
hatası fırlatacak şekilde değiştir — sessizce yanlış adrese gitmesin.

### 2.2 Mobilde çıkış yapınca önceki kullanıcının verisi kalıyor
`web-frontend/src/lib/stores.ts:47-53` çıkışta `localStorage.removeItem('ai-diet-storage')`
çağırıyor. `src/store/stores.ts:38-40` ise sadece `resetStore()` yapıyor, AsyncStorage'ı
**temizlemiyor**. Zustand `persist` bir sonraki açılışta eski kaydı geri yükler →
ortak kullanılan telefonda A kullanıcısının kilosu/planı B kullanıcısına görünür.

Ayrıca mobil sürümde "farklı kullanıcı girdi → önce sıfırla" dalı da yok (web'de var).

**Yapılacak:** `src/store/stores.ts`'i `web-frontend/src/lib/stores.ts` ile aynı mantığa
getir — ya da daha iyisi, aşağıdaki 3.1'i uygula.

---

## 3. YÜKSEK — Yapısal (asıl kök neden)

### 3.1 Aynı iş mantığının iki ayrı kopyası
`shared/` doğru kurulmuş ama **yarıda bırakılmış**. Hâlâ çift yazılmış olanlar:

| Mantık | Mobil | Web | Durum |
|---|---|---|---|
| Store bağlama/abonelik | `src/store/stores.ts` (43 sat.) | `web-frontend/src/lib/stores.ts` (57 sat.) | **Ayrışmış** → bulgu 2.2 |
| Haftalık plan modalı | `src/components/WeeklyDietPlanModal.tsx` (233) | `web-frontend/src/components/WeeklyDietPlanModal.tsx` (170) | Ayrışmış |
| Profil ekranı | `src/screens/ProfileScreen.tsx` (392) | `web-frontend/src/app/profile/page.tsx` (403) | Ayrışmış |
| Auth sarmalayıcı | `shared/components/AuthProvider.tsx` | `web-frontend/.../AuthGuard.tsx` | Kısmen |

Bulgu 2.2 bu ayrışmanın **kanıtı**: bir tarafa yazılan düzeltme diğerine geçmemiş.

**Kural:** UI dışındaki her şey (abonelik mantığı, storage temizleme, doğrulama,
formatlama) `shared/` içine. Platform dosyaları sadece render etsin.

### 3.2 LLM çıktısı doğrulanmıyor
`api/gemini/route.ts:147` yalnızca `JSON.parse` yapıyor; şema kontrolü yok.
`geminiService.ts:68` dönüş tipi `Promise<any>`, `AIChatScreen.tsx:60`
`setDraftWeeklyPlan(response)` ile doğrudan store'a giriyor. Gemini `days` alanını
eksik/farklı isimle dönerse `DietPlanScreen.tsx:102`'deki `weeklyDietPlan.days.map(...)`
runtime'da çöker — TypeScript bunu yakalayamaz çünkü tip `any`.

**Yapılacak:** `zod` zaten `node_modules`'da mevcut. `WeeklyDietPlan` ve
`DietPlanResponse` için şema yaz, route içinde `parse` et, `any` dönüşlerini gerçek
tiplerle değiştir.

### 3.3 Kalori hedefinde alt sınır yok — sağlık riski
`shared/utils/calculations.ts:116-118`:
```ts
if (goal === 'lose') return tdee - 500;
```
Kısa boylu / düşük kilolu bir kadında TDEE ~1350 → hedef **850 kcal/gün**. Bu, kabul
gören güvenli alt sınırların (kadın ~1200, erkek ~1500 kcal) belirgin altında ve bu
değer doğrudan Gemini'ye "bana bu kalorilik plan yap" diye gidiyor.

**Yapılacak:** cinsiyete göre taban uygula (`Math.max(floor, tdee - 500)`) ve arayüzde
tabana takıldığında kullanıcıyı bilgilendir.

### 3.4 Her tuş vuruşunda Firestore yazımı
`shared/store/useDietStore.ts:78-90` — `setUserData` her çağrıldığında
`setTimeout(..., 0)` içinde `saveUserProfile` tetikliyor. Profil formunda kiloyu
"72.5" yazmak 4 ayrı Firestore write demek. Maliyet + kota + gereksiz gecikme.

**Yapılacak:** yazımı ~800ms debounce et, ya da kaydetmeyi explicit "Kaydet" eylemine
bağla. Ayrıca `setTimeout(0)` yerine `set` içinde senkron hesap yapılabilir.

---

## 4. ORTA — Ölü kod ve yarım kalmış kurulum

### 4.1 `firestoreService.ts`'in yarısı hiç çağrılmıyor
Şu 7 export hiçbir yerden kullanılmıyor (grep ile doğrulandı):
`saveHistoryEntry`, `getHistoryEntries`, `saveDietPlan`, `getDietPlans`,
`saveChatMessages`, `getChatSessions`, `deleteChatSession`.

Pratik sonucu: **kilo geçmişi ve sohbet geçmişi buluta hiç yazılmıyor.** Sadece
cihazdaki `persist` katmanında; uygulama silinince veya cihaz değişince kaybolur —
kullanıcı bunu bilmiyor. Ya bağla ya sil; ikisinin arası en kötüsü.

### 4.2 NativeWind kurulu ama kullanılmıyor
`nativewind` + `tailwindcss` + `global.css` + `nativewind-env.d.ts` + `babel.config.js`
(`jsxImportSource`) + `metro.config.js` (`withNativeWind`) — hepsi yapılandırılmış.
Buna karşılık `src/` altındaki 11 dosyanın 10'u `StyleSheet.create` kullanıyor,
`className` yalnızca 1 dosyada geçiyor.

Aynı şekilde `shared/theme/colors.ts` var ama sadece `DashboardScreen.tsx:7`'de import
ediliyor; marka rengi `#00FF87` kod tabanında **80 kez** elle yazılmış.

**Yapılacak:** birini seç. Ya NativeWind'i tamamen kaldır (bağımlılık + 3 config
sadeleşir), ya da yeni ekranları className ile yaz ve renkleri `shared/theme`'den al.

### 4.3 Bozuk / bayat dosyalar
- `test_geminiService.ts` — `./src/services/geminiService` import ediyor; bu yol
  **yok** (dosya `shared/services/`'e taşınmış). Ayrıca `generateDietPlan(2000, "...")`
  eski 2 parametreli imzayı kullanıyor, güncel imza 3+ parametre. `tsconfig.json`
  `include` listesinde olmadığı için typecheck bunu hiç görmüyor. Sil.
- `tsconfig.json:10` — `"react-native": ["./node_modules/@types/react-native"]`
  eşlemesi, `@types/react-native`'in kaldırıldığı `ee60ad5` commit'inden sonra boş bir
  klasörü işaret ediyor. Sil.
- `tsconfig.json:19` — `include` yalnız `shared/**/*.ts` içeriyor, `.tsx` yok →
  `shared/components/AuthProvider.tsx` sadece dolaylı olarak kontrol ediliyor.
- `web-frontend/package.json` içinde `typecheck` script'i yok; kök `tsconfig.json`
  `web-frontend`'i exclude ediyor. Yani web tarafı hiçbir tek komutla kontrol edilmiyor.

### 4.4 Sürüm kayması ve paket yönetimi
İki ayrı `package.json`, workspace yok:
- `react`: mobil **19.2.3** / web **19.2.4**
- `firebase`, `zustand`, `@google/generative-ai` her iki tarafta ayrı ayrı sabitlenmiş

`shared/` her iki tarafça import edildiği için bu sürümlerin ayrışması sinsi hatalar
üretir. Ayrıca `@google/generative-ai` Google'ın **eski** SDK'sı; güncel paket
`@google/genai`. Bir ara migrasyon gerekecek.

### 4.5 Küçük mantık hatası
`src/screens/DietPlanScreen.tsx:18` — `Math.abs(today - startDate)` kullanıldığı için
ileri tarihli (bozuk) bir `weeklyPlanStartDate` de "geçerli" sayılıyor. Mutlak değer
kaldırılmalı.

---

## 5. Süreç

- **Test yok, CI yok.** Kalori/BMR/yağ oranı hesapları saf fonksiyon — birim test için
  ideal ve doğrudan sağlık çıktısı üretiyorlar. En azından `calculations.ts` test edilmeli.
- **Neredeyse hiçbir şey commit'li değil.** `src/`, `shared/`, `web-frontend/`, tüm
  config dosyaları git'te takipsiz; depoda sadece 2 commit var. Tek bir yanlış
  `git clean -fd` projeyi tamamen siler. Öncelik sırası: 1.1'i temizle → `.gitignore`'u
  düzelt (`*.apk`) → sonra her şeyi commit et.

---

## 6. Bir sonraki oturumda uyulacak kurallar

1. **`.env` / anahtar:** hiçbir koşulda kaynak dosyaya anahtar yazma. Deneme scripti
   bile olsa `process.env`'den oku.
2. **Yeni mantık `shared/`'a.** Mobil veya web dosyasına iş mantığı yazmadan önce
   karşı tarafta aynısının olup olmadığını kontrol et. Varsa çoğaltma — `shared/`'a taşı.
3. **Bir tarafı düzeltirken diğerine bak.** `src/store/stores.ts` ↔
   `web-frontend/src/lib/stores.ts`, `WeeklyDietPlanModal` ×2, `ProfileScreen` ↔
   `profile/page.tsx` — bunlar eşleşmiş çiftler.
4. **`@shared` alias'ı 4 dosyada tanımlı** (tsconfig, babel, metro, next.config).
   Birini değiştirdiysen dördünü de kontrol et.
5. **LLM çıktısına asla güvenme.** `JSON.parse` doğrulama değildir; `any` dönme.
6. **Sağlık hesaplarında sınır kontrolü zorunlu** — kalori, yağ oranı, BMI.
7. **Kod eklemeden önce ölü kod ara.** Bu projede zaten çağrılmayan 7 fonksiyon var;
   sekizincisini ekleme.
8. **İki komutla doğrula:** kökte `npm run typecheck`, `web-frontend`'de
   `npx tsc --noEmit`. Sadece birini çalıştırmak yanıltıcı.
9. **Büyük ikili dosyaları (APK/AAB) asla stage etme.**

---

## 7. Önerilen sıra

| # | İş | Etki |
|---|---|---|
| 1 | API anahtarını iptal et, `scratch_gemini_test.ts`'i sil | Güvenlik |
| 2 | `.gitignore` → `*.apk`, `*.aab`; ardından her şeyi commit et | Veri kaybı riski |
| 3 | `firestore.rules` yaz ve deploy et | Güvenlik |
| 4 | `EXPO_PUBLIC_API_URL` + API route deploy | APK'yı çalışır hale getirir |
| 5 | Mobil çıkışta AsyncStorage temizliği | Gizlilik hatası |
| 6 | Kalori alt sınırı | Sağlık riski |
| 7 | `stores.ts` çiftini `shared/`'da birleştir | 5. maddenin tekrarını önler |
| 8 | LLM çıktı şema doğrulaması | Çökme önleme |
| 9 | Firestore yazımını debounce et | Maliyet |
| 10 | Ölü kod temizliği + NativeWind kararı | Bakım |

---

## 8. Uygulanan düzeltmeler (2026-07-31)

### Güvenlik
- `scratch_gemini_test.ts` **silindi** (düz metin API anahtarı içeriyordu).
  → Anahtarın Google AI Studio'dan **iptal edilmesi hâlâ gerekli** — dosyayı silmek
  anahtarı geçersiz kılmaz.
- `test_geminiService.ts` silindi (var olmayan yolu import eden bayat dosya).
- `.gitignore`: `*.apk`, `*.aab`, `*.ipa`, `scratch_*.ts|js` eklendi.
- `firestore.rules` + `firebase.json` + `firestore.indexes.json` yazıldı.
  Sahiplik kuralı (`request.auth.uid == uid`), alt koleksiyonlar ve profil alanı
  doğrulaması dâhil; tanımsız yollar varsayılan olarak kapalı.
  → `firebase deploy --only firestore:rules` ile **deploy edilmesi gerekiyor**.
- API route artık anahtarı **yalnızca** `GEMINI_API_KEY`'den okuyor.
  `NEXT_PUBLIC_`/`EXPO_PUBLIC_` fallback'leri kaldırıldı — o önek anahtarı istemci
  paketine gömerdi.
- `systemPrompt` artık istemciden **alınmıyor**; sunucu kendi sabitini kullanıyor.
  (Önceden herkes prompt'u ezip modelin rolünü değiştirebilirdi.)
- Sohbet geçmişi son 20 mesajla sınırlandı, her mesaj 4000 karaktere kırpılıyor.
- Hata yanıtları artık ham model çıktısını ve yukarı akış hata mesajlarını
  istemciye sızdırmıyor.

### Fonksiyonel
- `getApiUrl()` production'da adres yoksa artık sessizce `localhost`'a düşmüyor,
  anlaşılır hata veriyor. `.env`'e `EXPO_PUBLIC_API_URL` alanı ve `.env.example`
  eklendi. → Değerin doldurulması ve API route'un deploy edilmesi **gerekiyor**.
- `fetchGeminiApi` ağ hatasını ve JSON olmayan (HTML hata sayfası) yanıtı ayrı ayrı
  ele alıyor; `response.json()` artık patlamıyor.
- **Auth↔Diet bağlama mantığı `shared/store/bindAuthToDietStore.ts`'e taşındı.**
  Mobil ve web artık aynı fonksiyonu çağırıyor. Çıkışta hem state sıfırlanıyor hem
  `persist.clearStorage()` çağrılıyor → önceki kullanıcının verisi mobilde de siliniyor.
- `resetStore` bekleyen profil yazımını iptal ediyor (çıkış sonrası boş profilin
  önceki kullanıcının dokümanına yazılmasını önler).

### Sağlık / doğruluk
- `calculateTargetCalories` cinsiyete göre alt sınır uyguluyor
  (`MIN_DAILY_CALORIES`: kadın 1200, erkek 1500). TDEE zaten sınırın altındaysa
  daha da düşürmüyor. Arayüz için `isCalorieFloorApplied` yardımcısı eklendi.
- `shared/utils/validation.ts` eklendi: `parseWeeklyDietPlan`,
  `parseDietPlanResponse`, `parseAlternativeFood`. Harici bağımlılık yok.
  API route JSON'u parse ettikten sonra **şemayı da doğruluyor**, başarısızlıkta 502.
- `geminiService`'teki kullanılmayan `apiKey` parametresi ve `any` dönüş tipleri
  kaldırıldı; 6 çağrı yeri güncellendi.
- `isWeeklyPlanValid` ve `recommendedWaterLiters` `shared/utils/calculations.ts`'e
  taşındı (mobil + web'de kopyaydı). `Math.abs` kaldırıldı → ileri tarihli plan
  artık geçersiz.

### Bakım
- `saveDailyWeight` artık kilo geçmişini Firestore'a da yazıyor;
  `loadUserDataFromFirestore` geçmişi geri yüklüyor. Geçmiş artık cihaz
  değişince kaybolmuyor. Kayıtlar `YYYY-MM-DD` doküman kimliğiyle upsert ediliyor.
- Profil yazımı 800 ms debounce edildi (her tuş vuruşunda write yoktu artık).
  `calculateMetrics` `setTimeout(0)` yerine senkron çağrılıyor.
- `firestoreService`'ten hiç çağrılmayan 5 fonksiyon silindi
  (`saveDietPlan`, `getDietPlans`, `saveChatMessages`, `getChatSessions`,
  `deleteChatSession`). Sohbet geçmişi bilinçli olarak cihazda kalıyor.
- `tsconfig.json`: ölü `react-native` path eşlemesi silindi, `shared/**/*.tsx`
  include'a eklendi. `web-frontend`'e `typecheck` script'i eklendi.

### Doğrulama
- `npm run typecheck` (kök) — temiz
- `npm run typecheck` (web-frontend) — temiz
- `npm run build` (web-frontend) — 10 route başarıyla derlendi
- Saf fonksiyonlar için 27 davranış kontrolü çalıştırıldı (kalori sınırı, plan
  geçerliliği, su önerisi, LLM şema doğrulaması) — tümü geçti

### Hâlâ açık — senin kararın veya erişimin gerekiyor
1. **Gemini API anahtarını iptal et** (dosya silindi ama anahtar hâlâ geçerli).
2. **`firebase deploy --only firestore:rules`** — kurallar yazıldı, deploy edilmedi.
3. **`EXPO_PUBLIC_API_URL` değerini doldur** ve API route'u deploy et.
4. **Her şeyi commit et** — depoda hâlâ 2 commit var, kod takipsiz.
5. **NativeWind kararı** — kalsın mı, kaldırılsın mı? 80 adet elle yazılmış
   `#00FF87` bu karara bağlı.
6. **Sürüm hizalaması** — react 19.2.3 / 19.2.4; `@google/generative-ai` →
   `@google/genai` migrasyonu.
7. **Test altyapısı** — henüz test runner yok; saf fonksiyonlar kontrol edildi ama
   kalıcı test dosyası olarak yazılmadı.
8. **`generateDietPlan` / `getAlternativeFood`** backend'de var ama hiçbir ekrandan
   çağrılmıyor — arayüze bağlanacak mı, silinecek mi?
9. **ESLint** web tarafında 14 hata / 6 uyarı veriyor (çoğu `set-state-in-effect`
   ve `any`) — bunlar rapor kapsamı dışındaydı, dokunulmadı.
10. **Mobil oturum kalıcılığı — cihazda test edilmeli.** [App.tsx:16](App.tsx:16)
    `initializeAuth(app)` çağrısını persistence parametresi olmadan yapıyor.
    Firebase JS SDK'da bu, React Native'de oturumun bellekte tutulması
    (uygulama kapanınca çıkış yapılması) anlamına gelebilir. `firebase@11.10.0`
    tip tanımlarında `getReactNativePersistence` görünmüyor, bu yüzden düzeltmeyi
    körlemesine yapmadım — yanlış değişiklik girişi tamamen bozar.
    **Kontrol:** giriş yap → uygulamayı tamamen kapat → yeniden aç. Login ekranı
    geliyorsa persistence eklenmesi gerekiyor.
