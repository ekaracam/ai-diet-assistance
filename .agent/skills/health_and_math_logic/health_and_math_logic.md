# Sağlık Formülleri ve Hesaplama Mantığı

Bu projedeki `/src/utils` klasöründe yer alacak matematiksel hesaplamalar kesinlikle aşağıdaki formüllere dayanmalıdır.

## 1. TDEE (Total Daily Energy Expenditure) Hesaplaması
Önce Mifflin-St Jeor denklemi ile BMR (Bazal Metabolizma Hızı) hesaplanmalıdır:
- **Erkekler:** BMR = (10 × kilo [kg]) + (6.25 × boy [cm]) - (5 × yaş [yıl]) + 5
- **Kadınlar:** BMR = (10 × kilo [kg]) + (6.25 × boy [cm]) - (5 × yaş [yıl]) - 161
Sonrasında BMR, kullanıcının seçtiği aktivite çarpanı (Örn: Hareketsiz 1.2, Hafif 1.375, Orta 1.55, Çok 1.725) ile çarpılarak TDEE bulunmalıdır.

## 2. Vücut Yağ Oranı (US Navy Formülü)
Ölçümler metrik sistemde (cm) alınacaktır. `log10` fonksiyonu kullanılmalıdır.
- **Erkekler için (% Yağ):** 495 / (1.0324 - 0.19077 * log10(bel - boyun) + 0.15456 * log10(boy)) - 450
- **Kadınlar için (% Yağ):** 495 / (1.29579 - 0.35004 * log10(bel + kalça - boyun) + 0.22100 * log10(boy)) - 450