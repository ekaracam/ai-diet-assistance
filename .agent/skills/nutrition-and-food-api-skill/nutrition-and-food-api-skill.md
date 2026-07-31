---
name: nutrition-and-food-api-skill
description: BMR (Mifflin-St Jeor) hesaplar, makro/mikro besin dağılımı yapar, kalori hedeflerini belirler ve harici gıda veritabanı API'lerinden gelen verileri standardize eder.
---

# Beslenme Hesaplamaları ve Gıda Verisi Becerisi

Bu beceri; kullanıcıların kişisel enerji ihtiyaçlarını analiz etmek, bilimsel formüllere dayalı diyet hedefleri (kalori açığı/fazlası) oluşturmak ve harici API'lerden (USDA, Open Food Facts, FatSecret) alınan besin değerlerini sistem için standart bir yapıya sokmak amacıyla kullanılır.

## When to use this skill

- Kullanıcı günlük alması gereken kalori, protein, karbonhidrat veya yağ miktarını sorduğunda.
- Kilo verme (cutting), kilo alma (bulking) veya kiloyu koruma hedeflerine yönelik yeni bir beslenme planı kurgulanacağı zaman.
- Belirli bir yiyeceğin, öğünün veya barkodlu bir ürünün makro ve mikro besin değerleri sorgulandığında.
- Open Food Facts, USDA veya FatSecret gibi harici bir servis üzerinden gıda verisi çekilmesi gerektiğinde.

## How to use it

Besin hesaplamaları yaparken ve API verilerini işlerken aşağıdaki adımları ve standartları sırasıyla uygula.

### 1. BMR ve TDEE Hesaplama
Bazal Metabolizma Hızı (BMR) için daima **Mifflin-St Jeor** denklemini kullan.

Erkekler için:
$$BMR = (10 \times m) + (6.25 \times h) - (5 \times a) + 5$$

Kadınlar için:
$$BMR = (10 \times m) + (6.25 \times h) - (5 \times a) - 161$$

*(Burada $m$ kütleyi kilogram, $h$ boyu santimetre ve $a$ yaşı yıl cinsinden ifade eder.)*

**Günlük Enerji Harcaması (TDEE) Çarpanları:** BMR değerini kullanıcının beyan ettiği aktivite seviyesiyle çarp.
* **Sedanter (Hareketsiz):** $BMR \times 1.2$
* **Hafif Aktif (Haftada 1-3 gün egzersiz):** $BMR \times 1.375$
* **Orta Aktif (Haftada 3-5 gün egzersiz):** $BMR \times 1.55$
* **Çok Aktif (Haftada 6-7 gün ağır egzersiz):** $BMR \times 1.725$
* **Ekstra Aktif (Fiziksel meslek + ağır antrenman):** $BMR \times 1.9$

### 2. Kalori Açığı ve Fazlası Standartları
Kullanıcının TDEE (Günlük Enerji Harcaması) değerini bulduktan sonra, hedefine uygun modifikasyonu yap:
* **Kalori Açığı (Kilo Verme):** Sürdürülebilir yağ yakımı için TDEE üzerinden **%15-20** oranında veya sabit **300-500 kcal** kesinti yap.
* **Kalori Fazlası (Kilo Alma / Kas Gelişimi):** Yağlanmayı minimumda tutarak kas inşa etmek için TDEE'ye **%10-15** oranında veya sabit **250-500 kcal** ekle.
* **Kilo Koruma:** TDEE değerini doğrudan günlük hedef olarak belirle.

### 3. Makro Dağılımı ve Mikro Hedefler
Kalori hedefi (Target Kcal) netleştikten sonra makro dağılımını şu sabit enerji değerlerine (1g Protein = 4 kcal, 1g Yağ = 9 kcal, 1g Karbonhidrat = 4 kcal) dayanarak aşağıdaki sırayla yap:
1. **Protein:** Kullanıcının kilosuna göre **1.6g - 2.2g / kg** olarak sabitle.
2. **Yağ:** Toplam kalori hedefinin **%20 - %30'u** aralığında tut (Hormonal fonksiyonlar için kg başına en az 0.8g'ın altına düşme).
3. **Karbonhidrat:** Protein ve yağdan gelen toplam kaloriyi, hedeflenen kaloriden çıkar; kalan tüm enerjiyi karbonhidrata ayır.
4. **Mikro/Lif:** Kadınlar için günlük **25g**, erkekler için **38g** lif hedefini nota ekle.

### 4. Harici API Entegrasyonu ve Veri Standardizasyonu
Open Food Facts, USDA FoodData Central veya FatSecret API'lerine istek attığında (HTTP GET/POST), dönen karmaşık JSON yanıtını sistemin doğrudan kullanabileceği tek tip bir şemaya oturt.

**İstek ve Ayrıştırma (Parsing) Kuralları:**
1. Arama sorgusunu yaparken ilgili API'nin endpoint kurallarına uy (örneğin USDA için `fdc/v1/foods/search`).
2. Gelen yanıttaki dağınık makro/mikro verilerini (`nutriments`, `foodNutrients` vb.) bul ve ayıkla.
3. Değerleri her zaman **100 gramlık standart porsiyon** üzerinden oranla. API porsiyon bazlı veri döndürdüyse matematiksel olarak 100 grama dönüştür.
4. Eksik (`null`) veya belirsiz mikro besinler için varsayılan olarak `0.0` değerini ata.

**Standart Çıktı Formatı (JSON):**
Dönen ham API verisini sadece aşağıdaki JSON yapısına dönüştürerek ilet:

```json
{
  "food_id": "API_ID_VEYA_BARKOD",
  "food_name": "Gıdanın Adı",
  "serving_size_g": 100,
  "calories": 0.0,
  "macros": {
    "protein_g": 0.0,
    "carbohydrates_g": 0.0,
    "fat_g": 0.0
  },
  "micros": {
    "fiber_g": 0.0,
    "sugar_g": 0.0,
    "sodium_mg": 0.0
  },
  "source_api": "USDA | OpenFoodFacts | FatSecret"
}