/**
 * Body metric calculations
 * US Navy Body Fat Formula + Mifflin-St Jeor BMR/TDEE + BMI
 * Merged from both mobile and web implementations
 */

import type { Gender, UserGoal } from '../types/user';

/** US Navy Yağ Oranı Hesaplama */
export const calculateUSNavyBodyFat = (
  gender: Gender,
  height: number, // cm
  neck: number,   // cm
  waist: number,  // cm
  hip?: number    // cm (required for females)
): number | null => {
  if (height <= 0 || neck <= 0 || waist <= 0) return null;

  if (gender === 'male') {
    if (waist - neck <= 0) return null;
    const result =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist - neck) +
          0.15456 * Math.log10(height)) -
      450;
    if (result < 2) return null;
    return parseFloat(result.toFixed(1));
  } else {
    if (!hip || waist + hip - neck <= 0) return null;
    const result =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist + hip - neck) +
          0.22100 * Math.log10(height)) -
      450;
    if (result < 10) return null;
    return parseFloat(result.toFixed(1));
  }
};

/** Bazal Metabolizma Hızı (Mifflin-St Jeor) */
export const calculateBMR = (
  gender: Gender,
  age: number,
  height: number, // cm
  weight: number  // kg
): number | null => {
  if (age <= 0 || height <= 0 || weight <= 0) return null;

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
};

/** Günlük Toplam Enerji Harcaması */
export const calculateTDEE = (
  gender: Gender,
  age: number,
  height: number,    // cm
  weight: number,    // kg
  activityLevel: number // 1.2, 1.375, 1.55, 1.725, 1.9
): number | null => {
  if (age <= 0 || height <= 0 || weight <= 0) return null;

  const bmr = calculateBMR(gender, age, height, weight);
  if (!bmr) return null;

  return Math.round(bmr * activityLevel);
};

/** Vücut Kitle İndeksi */
export const calculateBMI = (
  height: number, // cm
  weight: number  // kg
): number | null => {
  if (height <= 0 || weight <= 0) return null;
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
};

/** BMI Kategorisi */
export const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Zayıf', color: '#60EFFF' };
  if (bmi < 25)   return { label: 'Normal', color: '#00FF87' };
  if (bmi < 30)   return { label: 'Fazla Kilolu', color: '#FFD700' };
  return { label: 'Obez', color: '#FF4757' };
};

/** Yağ Oranı Kategorisi */
export const getBodyFatCategory = (bodyFat: number, gender: Gender): { label: string; color: string; desc: string } => {
  if (gender === 'male') {
    if (bodyFat < 6) return { label: 'Esansiyel', color: '#60EFFF', desc: '%2-5' };
    if (bodyFat < 14) return { label: 'Sporcu', color: '#00FF87', desc: '%6-13' };
    if (bodyFat < 18) return { label: 'Sağlıklı', color: '#00FF87', desc: '%14-17' };
    if (bodyFat < 25) return { label: 'Kabul Edilebilir', color: '#FFD700', desc: '%18-24' };
    return { label: 'Obezite', color: '#FF4757', desc: '%25+' };
  } else {
    if (bodyFat < 14) return { label: 'Esansiyel', color: '#60EFFF', desc: '%10-13' };
    if (bodyFat < 21) return { label: 'Sporcu', color: '#00FF87', desc: '%14-20' };
    if (bodyFat < 25) return { label: 'Sağlıklı', color: '#00FF87', desc: '%21-24' };
    if (bodyFat < 32) return { label: 'Kabul Edilebilir', color: '#FFD700', desc: '%25-31' };
    return { label: 'Obezite', color: '#FF4757', desc: '%32+' };
  }
};

/**
 * Güvenli günlük minimum kalori alt sınırları.
 * Yaygın kabul gören eşikler: kadın 1200 kcal, erkek 1500 kcal.
 * Bunun altı tıbbi gözetim gerektirir ve uygulama bu değeri doğrudan Gemini'ye
 * "bana bu kalorilik plan yap" diye gönderdiği için sınır ZORUNLU.
 */
export const MIN_DAILY_CALORIES: Record<Gender, number> = {
  female: 1200,
  male: 1500,
};

/**
 * Hedef Kalori Hesaplama
 *
 * Kilo verme hedefinde TDEE'den 500 kcal düşülür, ancak sonuç asla cinsiyete
 * göre güvenli alt sınırın altına inmez. (Örn. TDEE 1350 olan bir kadında
 * sınırsız hesap 850 kcal/gün üretiyordu.)
 */
export const calculateTargetCalories = (
  tdee: number,
  goal: UserGoal,
  gender: Gender = 'female' // bilinmiyorsa daha koruyucu olan düşük sınır
): number => {
  if (goal === 'gain') return tdee + 500;
  if (goal !== 'lose') return tdee;

  const floor = MIN_DAILY_CALORIES[gender];
  // TDEE zaten sınırın altındaysa daha da düşürme — TDEE'yi koru
  return Math.max(Math.min(tdee, floor), tdee - 500);
};

/** Hedef kalori güvenli alt sınıra takıldı mı? (arayüzde kullanıcıyı bilgilendirmek için) */
export const isCalorieFloorApplied = (
  tdee: number,
  goal: UserGoal,
  gender: Gender
): boolean => goal === 'lose' && tdee - 500 < MIN_DAILY_CALORIES[gender];

/** Haftalık planın geçerlilik süresi (gün) */
export const WEEKLY_PLAN_VALID_DAYS = 7;

/**
 * Haftalık plan hâlâ geçerli mi?
 *
 * Math.abs KULLANILMAZ: mutlak değer alınırsa ileri tarihli (bozuk veya saati
 * ileri alınmış cihazdan gelen) bir startDate de "geçerli" sayılır.
 */
export const isWeeklyPlanValid = (startDate: string | null | undefined): boolean => {
  if (!startDate) return false;
  const startMs = new Date(startDate).getTime();
  if (!Number.isFinite(startMs)) return false;
  const diffDays = (Date.now() - startMs) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= WEEKLY_PLAN_VALID_DAYS;
};

/** Kiloya göre önerilen günlük su miktarı (litre) — 35 ml/kg */
export const recommendedWaterLiters = (weightKg: string | number | null | undefined): number => {
  const w = typeof weightKg === 'string' ? parseFloat(weightKg.replace(',', '.')) : weightKg;
  if (typeof w !== 'number' || !Number.isFinite(w) || w <= 0) return 2.5;
  return parseFloat(((w * 35) / 1000).toFixed(1));
};

/** Form verisinden tüm metrikleri hesapla */
export const calculateAllMetrics = (
  gender: Gender | null,
  age: string,
  height: string,
  weight: string,
  neck: string,
  waist: string,
  hip: string,
  activityLevel: number,
  goal: UserGoal
) => {
  const ageNum = parseInt(age, 10);
  const heightNum = parseFloat(height.replace(',', '.'));
  const weightNum = parseFloat(weight.replace(',', '.'));
  const neckNum = parseFloat(neck.replace(',', '.'));
  const waistNum = parseFloat(waist.replace(',', '.'));
  const hipNum = hip ? parseFloat(hip.replace(',', '.')) : undefined;

  // BMI
  const bmi = (!isNaN(heightNum) && !isNaN(weightNum))
    ? calculateBMI(heightNum, weightNum)
    : null;

  // BMR / TDEE / Target Calories
  let bmr: number | null = null;
  let tdee: number | null = null;
  let targetCalories: number | null = null;

  if (gender && !isNaN(ageNum) && !isNaN(heightNum) && !isNaN(weightNum)) {
    bmr = calculateBMR(gender, ageNum, heightNum, weightNum);
    tdee = calculateTDEE(gender, ageNum, heightNum, weightNum, activityLevel);
    if (tdee) {
      targetCalories = calculateTargetCalories(tdee, goal, gender);
    }
  }

  // Body Fat
  let bodyFatPercentage: number | null = null;
  if (gender && !isNaN(heightNum) && !isNaN(neckNum) && !isNaN(waistNum)) {
    bodyFatPercentage = calculateUSNavyBodyFat(
      gender, heightNum, neckNum, waistNum, hipNum
    );
  }

  return { bmr, tdee, bmi, bodyFatPercentage, targetCalories };
};
