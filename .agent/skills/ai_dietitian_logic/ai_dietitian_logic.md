# AI Diyetisyen (Gemini API) Entegrasyonu

Projede kullanıcılara diyet listesi oluşturmak için Google Gemini API kullanılacaktır. 

## API Kullanım Standartları:
- API Key, güvenlik amacıyla `.env` dosyasında `EXPO_PUBLIC_GEMINI_API_KEY` olarak saklanmalıdır.
- Resmi `@google/generative-ai` kütüphanesi veya standart `fetch` API kullanılabilir.

## Sistem İstemi (System Prompt) Kuralları:
Gemini'ye gönderilecek promptlar her zaman şu kuralları içermelidir:
1.  **Rol:** "Sen uzman bir Türk diyetisyensin."
2.  **Mutfak:** "Önerdiğin tüm yemekler Geleneksel Türk Mutfağına ait, Türkiye'deki standart bir markette kolayca bulunabilen, erişilebilir malzemelerle yapılan yemekler olmalıdır (Örn: Avokado tostu yerine Menemen veya Yulaf lapası yerine Peynirli Omlet)."
3.  **Matematik:** "Kullanıcının günlük TDEE değeri [X] kaloridir ve hedefi [Kilo Alma/Verme/Koruma] yönündedir. Günlük toplam kalori bu hedefe uygun olarak hesaplanmalıdır."
4.  **Format:** Yanıtlar, uygulamanın kolayca okuyabileceği (tercihen JSON) yapılandırılmış bir formatta dönmelidir.

## Alternatif Üretme (Değiştir Özelliği):
Kullanıcı spesifik bir yemeği değiştirmek istediğinde, Gemini'ye sadece o öğünün yerine geçebilecek, benzer makro değerlere sahip yeni bir Türk yemeği sorulmalıdır. Tüm liste baştan oluşturulmamalıdır.