# Tasarım Dili ve UI Standartları

Bu uygulamanın genel teması; temiz, modern, "analog", samimi ve organik bir histir.

## Renk Paleti (NativeWind sınıflarında bu tonlara sadık kalınacaktır):
- **Arka Planlar:** Krem ve açık bej tonları (Örn: `bg-stone-50`, `bg-orange-50` veya özel tanımlı krem renkleri).
- **Vurgu (Accent) Renkleri:** Soft yeşil tonları (Doğayı ve sağlığı temsil eden, örn: `text-emerald-600`, `bg-teal-500`).
- **Metinler:** Keskin siyah yerine koyu gri/kahve tonları (Örn: `text-stone-800`).

## Bileşen Yapısı:
- Butonlar ve kartlar hafif yuvarlatılmış köşelere (rounded-xl, rounded-2xl) sahip olmalıdır.
- Çok sert gölgelerden (shadow-2xl) kaçınılmalı, daha soft derinlikler (shadow-sm, shadow-md) tercih edilmelidir.
- Grafikler (`react-native-chart-kit`) bu renk paletine entegre edilmeli, veri çizgileri soft yeşil olmalıdır.