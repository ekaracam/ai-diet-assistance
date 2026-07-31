/** Cinsiyet seçenekleri */
export type Gender = 'male' | 'female';

/** Aktivite seviyesi çarpanları */
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';

/** Aktivite seviyesi sayısal değerleri */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

/** Aktivite seviyesi etiketleri */
export const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; desc: string; emoji: string }> = {
  sedentary: { label: 'Hareketsiz', desc: 'Masa başı iş', emoji: '🪑' },
  light: { label: 'Az Hareketli', desc: 'Hafif egzersiz, haftada 1-3', emoji: '🚶' },
  moderate: { label: 'Orta Hareketli', desc: 'Düzenli spor, haftada 3-5', emoji: '🏃' },
  active: { label: 'Çok Hareketli', desc: 'Ağır egzersiz, haftada 6-7', emoji: '🏋️' },
  extra: { label: 'Profesyonel', desc: 'Günde 2 antrenman', emoji: '⚡' },
};

/** Kullanıcı hedefi */
export type UserGoal = 'lose' | 'maintain' | 'gain';

/** Hedef etiketleri */
export const GOAL_LABELS: Record<UserGoal, { label: string; desc: string }> = {
  lose: { label: 'Kilo Ver', desc: '-500 kcal/gün' },
  maintain: { label: 'Koru', desc: 'Bakım kalorisi' },
  gain: { label: 'Kilo Al', desc: '+500 kcal/gün' },
};

/** Kullanıcı profil verileri */
export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number;           // cm
  weight: number;           // kg
  neckCircumference: number;    // cm
  waistCircumference: number;   // cm
  hipCircumference?: number;    // cm (kadınlar için zorunlu)
  activityLevel: number;        // 1.2 - 1.9 arası sayısal değer
  goal: UserGoal;
}

/** Form state'i — string olarak tutulur, submit'te parse edilir */
export interface UserFormData {
  name?: string;
  email?: string;
  birthDate?: string;
  age: string;
  gender: Gender | null;
  height: string;
  weight: string;
  neck: string;
  waist: string;
  hip: string;
  activityLevel: number;
  goal: UserGoal;
}

/** Geçmiş veri kaydı (grafik için) */
export interface HistoryEntry {
  id?: string;
  date: string;             // ISO format tarih
  weight: number;           // kg
  bodyFatPercentage: number;    // %
  waistCircumference?: number;  // cm
}

/** Hesaplanan metrikler */
export interface CalculatedMetrics {
  bmr: number | null;
  tdee: number | null;
  bmi: number | null;
  bodyFatPercentage: number | null;
  targetCalories: number | null;
}

/** Varsayılan form verisi */
export const DEFAULT_FORM_DATA: UserFormData = {
  name: '',
  email: '',
  birthDate: '',
  age: '',
  gender: null,
  height: '',
  weight: '',
  neck: '',
  waist: '',
  hip: '',
  activityLevel: 1.2,
  goal: 'lose',
};
