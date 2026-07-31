# AI Diyet Asistanı — Web

Projenin Next.js 16 (App Router) istemcisi. Kurulum, ortam değişkenleri ve mimari için
depo kökündeki [README](../README.md) dosyasına bakın.

Bu paket aynı zamanda **projenin tek Gemini çıkışını** barındırır: mobil uygulama da
dahil olmak üzere tüm AI çağrıları `src/app/api/gemini/route.ts` üzerinden geçer ve
`GEMINI_API_KEY` yalnızca bu sunucu tarafı route'ta okunur.

## Komutlar

```bash
npm run dev        # http://localhost:3000
npm run build
npm run typecheck  # tsc --noEmit
npm run lint
```

## Yapı

```
src/
  app/
    page.tsx            /          Özet (dashboard)
    profile/page.tsx    /profile   Profil & hedef
    plan/page.tsx       /plan      Haftalık diyet programı
    ai/page.tsx         /ai        AI sohbet
    login/ register/               Firebase Auth ekranları
    api/gemini/route.ts            Gemini proxy — anahtar yalnızca burada
  components/
    auth/AuthGuard.tsx             oturum yoksa /login'e yönlendirir
    layout/BottomNav.tsx
    ui/                            GlassCard, GlassButton
    WeeklyDietPlanModal.tsx
  lib/stores.ts                    @shared store factory'sini localStorage ile kurar
```

İş mantığı burada değil, depo kökündeki `shared/` altındadır (`@shared` alias'ı
`next.config.ts` içinde `turbopack.resolveAlias` ile tanımlıdır). Yeni mantık yazmadan
önce kök README'deki "Neden `shared/`" bölümünü okuyun.

## Ortam değişkenleri

`web-frontend/.env.local` (git'e girmez):

```env
GEMINI_API_KEY=...          # sunucu tarafı — NEXT_PUBLIC_ öneki KULLANMAYIN
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
