# AI Diyet Asistanı

Yapay zekâ destekli kişisel beslenme takip uygulaması. Vücut ölçülerinden BMR, TDEE, BMI ve
yağ oranını hesaplar, hedefe göre günlük kalori bütçesi çıkarır ve Google Gemini ile Türk
mutfağına uygun haftalık diyet programı üretir.

- **Tek çekirdek, iki istemci:** iş mantığı (store'lar, hesaplamalar, servisler, tipler)
  `shared/` altında TypeScript ile yazıldı; Expo (React Native) ve Next.js uygulamaları bu
  çekirdeği ortak kullanır.
- **Gemini anahtarı istemciye hiç girmez:** mobil dahil tüm AI çağrıları tek bir Next.js
  API route'undan (`/api/gemini`) geçer; anahtar yalnızca sunucuda okunur.
- **Doğrulanmış LLM çıktısı:** plan üreten yanıtlar şema kontrolünden geçer; bozuk yanıt
  arayüze ulaşmadan 502 ile reddedilir.
- **Firebase Auth + Firestore:** kullanıcı başına sahiplik kurallarıyla korunan profil, kilo
  geçmişi ve diyet planı.

---

## Ekranlar

| Özet | Profil ve Hedef |
|---|---|
| ![Özet](portfolio_images/01_Dashboard.png) | ![Profil](portfolio_images/02_Profile.png) |

| Diyet Programı | AI Asistan |
|---|---|
| ![Program](portfolio_images/03_Diet_Plan.png) | ![AI Asistan](portfolio_images/04_AI_Assistant.png) |

> Görsellerdeki değerler örnek (mock) verilerdir. Mobil görünümler aynı klasörde `*_mobile.png`
> adıyla yer alır.

---

## Özellikler

- **Metrik hesaplama:** US Navy yağ oranı formülü, Mifflin-St Jeor BMR, aktivite katsayılı
  TDEE, BMI ve kategori etiketleri.
- **Güvenli kalori hedefi:** kilo verme hedefinde açık uygulanırken cinsiyete özel alt sınırın
  (kadın 1200, erkek 1500 kcal) altına inilmez.
- **Haftalık AI diyet planı:** AI asistan ekranındaki kısayolla Gemini'den 7 günlük, öğün
  bazlı program alınır; plan 7 gün geçerli sayılır.
- **Plan düzenleme:** kullanıcı serbest metinle (ör. "kırmızı et olmasın") mevcut planı
  revize ettirebilir.
- **AI sohbet:** beslenme soruları için asistan; hazır öneri kısayolları ve kullanıcının
  profil bilgileriyle zenginleştirilmiş bağlam.
- **İlerleme takibi:** her hesaplamada günlük kilo ve yağ oranı kaydı, kilo grafiği ve kiloya
  göre önerilen günlük su miktarı.
- **Kimlik doğrulama ve senkronizasyon:** Firebase Auth ve Firestore; profil, kilo geçmişi ve
  haftalık plan buluta yazılır, cihaz değişse de korunur.

---

## Mimari

```
shared/                     ← platform bağımsız çekirdek (iki istemci de kullanır)
  types/                      ortak tipler
  store/                      Zustand store factory'leri (storage dışarıdan enjekte edilir)
    useDietStore.ts             createDietStore(storage)
    bindAuthToDietStore.ts      auth ↔ diet bağlantısı, çıkışta temizleme
  services/                   firebaseConfig, authService, firestoreService, geminiService
  components/                 AuthProvider
  utils/
    calculations.ts             BMR / TDEE / BMI / yağ oranı / kalori hedefi
    validation.ts               LLM çıktısı için şema doğrulama
  theme/                      renk, tipografi ve boşluk token'ları

src/                        ← Expo / React Native (StyleSheet + React Navigation)
  store/stores.ts             factory'yi AsyncStorage ile kurar
  screens/ components/ navigation/

web-frontend/               ← Next.js 16 (App Router, Tailwind CSS v4)
  src/lib/stores.ts           factory'yi localStorage ile kurar
  src/app/api/gemini/route.ts tek Gemini çıkışı; anahtar yalnızca burada, sunucu tarafında
  src/app/                    /, /profile, /plan, /ai, /login, /register
```

### Neden `shared/`

Store bağlama, depolama temizliği, doğrulama ve hesaplama mantığı tek yerde duruyor; böylece
aynı düzeltme iki kez yapılmıyor. Önceden mobil ve web store'ları ayrı yazılmıştı ve çıkışta
depolama temizliği yalnızca web'de vardı: ortak kullanılan bir telefonda önceki kullanıcının
sağlık verisi kalabiliyordu. Bu mantık artık `shared/store/bindAuthToDietStore.ts` içinde tek
kopya olarak duruyor.

> `@shared` alias'ı beş yerde ayrı ayrı tanımlıdır: `tsconfig.json`, `babel.config.js`,
> `metro.config.js`, `web-frontend/tsconfig.json` ve `web-frontend/next.config.ts`.
> **Birini değiştirirken hepsini kontrol edin.**

### Gemini çağrıları neden sunucudan geçiyor

Gemini API anahtarı istemci paketine asla girmez. Mobil uygulama da dahil olmak üzere tüm AI
çağrıları `web-frontend/src/app/api/gemini/route.ts` üzerinden yapılır:

```
Expo / Next.js istemcisi  →  /api/gemini  →  Gemini
                              (GEMINI_API_KEY yalnızca burada)
```

Route şu işlemleri (`action`) destekler: haftalık plan üretimi (`generateWeeklyDietPlan`),
plan düzenleme (`modifyWeeklyDietPlan`), alternatif öğün önerisi (`getAlternativeFood`),
sohbet (`sendChatMessage`) ve günlük plan üretimi (`generateDietPlan`).

Ayrıca route:

- sistem prompt'unu istemciden almaz, kendi sabitini kullanır;
- sohbet geçmişini son 20 mesajla, her mesajı 4000 karakterle sınırlar;
- plan döndüren yanıtları `shared/utils/validation.ts` ile şema doğrulamasından geçirir;
- ham model hatalarını istemciye sızdırmaz, genel bir hata mesajı döner.

---

## Teknoloji

| Katman | Kullanılan |
|---|---|
| Mobil | Expo ~57, React Native 0.86, React Navigation 7, react-native-chart-kit |
| Web | Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Recharts |
| Ortak | TypeScript, Zustand 5 (persist), Firebase 11 (Auth + Firestore) |
| AI | Google Gemini (`@google/generative-ai`) |

---

## Kurulum

### Gereksinimler

- Node.js 20+
- Authentication ve Cloud Firestore'u etkin bir Firebase projesi
- Google AI Studio'dan alınmış bir Gemini API anahtarı
- Firestore kurallarını yayınlamak için Firebase CLI (`firebase-tools`)

### 1. Depoyu klonlayın ve bağımlılıkları kurun

```bash
git clone https://github.com/ekaracam/ai-diet-assistance.git
cd ai-diet-assistance
npm install
npm --prefix web-frontend install
```

### 2. Ortam değişkenleri

Kök dizinde `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

```env
# Gemini çağrılarının gideceği adres. Mobil derleme için ZORUNLU:
# boş bırakılırsa APK localhost'a (yani telefonun kendisine) istek atar.
EXPO_PUBLIC_API_URL=https://ornek-dagitim.vercel.app

EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Ardından `web-frontend/.env.local` dosyasını elle oluşturun (bu dosya için örnek şablon yoktur):

```env
GEMINI_API_KEY=...                      # sunucu tarafı; asla NEXT_PUBLIC_ öneki almaz
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> Firebase **istemci** anahtarlarının herkese açık olması normaldir; erişim kontrolü API
> anahtarıyla değil [`firestore.rules`](firestore.rules) ile sağlanır. `GEMINI_API_KEY` ise
> gerçek bir sırdır: `NEXT_PUBLIC_` veya `EXPO_PUBLIC_` önekini **kullanmayın**, bu önek
> anahtarı istemci paketine gömer.

### 3. Firestore kurallarını yayınlayın

Depodaki `.firebaserc` orijinal projeyi gösterir; önce kendi projenizi seçin:

```bash
firebase use --add
firebase deploy --only firestore:rules
```

### 4. Çalıştırın

```bash
npm --prefix web-frontend run dev   # web   → http://localhost:3000
npm run start                       # mobil → Expo Go / geliştirme derlemesi
```

Mobil uygulama AI özellikleri için web sunucusuna ihtiyaç duyar. `EXPO_PUBLIC_API_URL`
tanımlı değilse geliştirme modunda `http://localhost:3000` kullanılır; bu yalnızca emülatör
veya simülatör aynı makinedeyse çalışır. Gerçek cihazda bu değişken çalışan bir Next.js
dağıtımını ya da makinenizin LAN adresini göstermelidir.

Kökteki diğer betikler: `npm run android`, `npm run ios` (yerel derleme) ve `npm run web`
(Expo web).

---

## Doğrulama

Proje iki ayrı TypeScript projesinden oluşur; **ikisini de** kontrol edin:

```bash
npm run typecheck                       # kök (App.tsx, src/, shared/)
npm --prefix web-frontend run typecheck # web-frontend
```

Web tarafı için ek olarak:

```bash
npm --prefix web-frontend run lint
npm --prefix web-frontend run build
```

---

## Güvenlik notları

- Sağlık verileri (kilo, boy, yağ oranı, diyet planı) Firestore'da `users/{uid}` altında
  tutulur. [`firestore.rules`](firestore.rules) sahiplik kuralı uygular
  (`request.auth.uid == uid`), profil alanlarında tip ve uzunluk kontrolü yapar; açıkça izin
  verilmeyen tüm yollar varsayılan olarak kapalıdır.
- Çıkış yapıldığında hem store sıfırlanır hem kalıcı depolama (`AsyncStorage` /
  `localStorage`) temizlenir; ortak kullanılan cihazda önceki kullanıcının verisi kalmaz.
- LLM çıktısı yalnızca `JSON.parse` başarılı olduğu için geçerli sayılmaz;
  `shared/utils/validation.ts` şema kontrolü yapar, başarısızlıkta route 502 döner.
- Kalori hedefi cinsiyete özel alt sınırın altına inemez.

---

## Bilinen eksikler

- Otomatik test ve CI yok (hesaplama fonksiyonları saf ve teste hazır).
- Kalori alt sınırına takılma durumu `isCalorieFloorApplied` ile hesaplanabiliyor ancak
  arayüzde henüz kullanıcıya gösterilmiyor.
- Alternatif öğün önerisi (`getAlternativeFood`) ve günlük plan üretimi (`generateDietPlan`)
  route ve servis katmanında hazır, ancak henüz bir ekrana bağlanmadı.
- Mobilde su takibi bileşeni (`WaterTracker`) yazıldı ama ekranlarda kullanılmıyor; şu an
  yalnızca önerilen su miktarı gösteriliyor.
- Web tarafında ESLint hataları mevcut (çoğunlukla `set-state-in-effect` ve `any`).
- NativeWind kurulu, ancak mobil ekranların büyük kısmı `StyleSheet` kullanıyor.
- `react` sürümleri iki tarafta birebir aynı değil (19.2.3 / 19.2.4).
- `@google/generative-ai` Google'ın eski SDK'sı; güncel paket `@google/genai`.

Ayrıntılı teknik değerlendirme: [`docs/PROJE-ANALIZ-RAPORU.md`](docs/PROJE-ANALIZ-RAPORU.md)

---

## Lisans

[MIT](LICENSE)
