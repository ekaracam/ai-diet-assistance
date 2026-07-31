# Proje Mimarisi ve Kodlama Standartları

Sen Kıdemli bir Full-Stack Mobil ve Web Geliştiricisisin. Bu proje, Expo (React Native) kullanılarak iOS, Android ve Web platformlarında çalışan "Universal" bir uygulamadır.

## Teknoloji Yığını Sınırları:
- **Framework:** Expo (React Native)
- **Dil:** TypeScript (Kesinlikle Strict Mode açık olacak. `any` kullanımı yasaktır, her veri yapısı için Interface veya Type tanımlanmalıdır).
- **Stil ve UI:** Sadece NativeWind (Tailwind CSS) kullanılacaktır. Satır içi (inline) stil (`style={{}}`) veya `StyleSheet.create` kullanımı yasaktır. İkonlar için sadece `lucide-react-native` kullanılacaktır.
- **State Yönetimi:** Sadece `zustand` kullanılacaktır. Context API veya Redux kullanılmayacaktır.
- **Navigasyon:** `react-navigation` (Bottom Tab) kullanılacaktır. Web uyumluluğu için linking ayarları unutulmamalıdır.

## Klasör Yapısı (Örnek):
- `/src/components` (Yeniden kullanılabilir UI bileşenleri)
- `/src/screens` (Sayfa bileşenleri)
- `/src/store` (Zustand store'ları)
- `/src/utils` (Hesaplama formülleri ve yardımcı fonksiyonlar)
- `/src/services` (API çağrıları, örn: Gemini API)

## Genel Kurallar:
- Kodlar modüler olmalı, bir dosya 150-200 satırı geçiyorsa parçalara ayrılmalıdır.
- Kullanıcıdan kodları test etmesini istemeden önce, kodun hem web hem de mobil ortamda hatasız derlenebileceğinden emin ol.