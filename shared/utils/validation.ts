/**
 * LLM çıktı doğrulama
 *
 * JSON.parse doğrulama DEĞİLDİR — sadece "sözdizimi geçerli" der.
 * Gemini alan adını değiştirirse veya bir alanı atlarsa parse başarılı olur,
 * çökme arayüzde (`weeklyDietPlan.days.map(...)`) gerçekleşir.
 *
 * Buradaki fonksiyonlar modelden gelen veriyi uygulama tiplerine geçmeden önce
 * yapısal olarak doğrular. Harici bağımlılık yok — hem Expo hem Next tarafında çalışır.
 */

import type { DietMeal, DietPlanResponse, DayPlan, WeeklyDietPlan } from '../types/diet';

/** Doğrulama hatası — API route bunu 502'ye çevirir */
export class InvalidAIResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAIResponseError';
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Sonlu, negatif olmayan, makul aralıkta bir sayıya çevir */
const toCalories = (v: unknown, path: string): number => {
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 10000) {
    throw new InvalidAIResponseError(`${path}: geçersiz kalori değeri (${String(v)})`);
  }
  return Math.round(n);
};

const toText = (v: unknown, path: string, maxLen: number): string => {
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new InvalidAIResponseError(`${path}: metin bekleniyordu`);
  }
  return v.trim().slice(0, maxLen);
};

const parseMeal = (v: unknown, path: string): DietMeal => {
  if (!isObject(v)) throw new InvalidAIResponseError(`${path}: nesne bekleniyordu`);
  return {
    meal: toText(v.meal, `${path}.meal`, 60),
    food: toText(v.food, `${path}.food`, 600),
    calories: toCalories(v.calories, `${path}.calories`),
  };
};

/** Günlük diyet planı yanıtını doğrula */
export const parseDietPlanResponse = (v: unknown): DietPlanResponse => {
  if (!isObject(v)) throw new InvalidAIResponseError('Yanıt bir nesne değil');
  if (!Array.isArray(v.dietPlan) || v.dietPlan.length === 0) {
    throw new InvalidAIResponseError('dietPlan: boş olmayan dizi bekleniyordu');
  }

  const dietPlan = v.dietPlan.map((m, i) => parseMeal(m, `dietPlan[${i}]`));
  const totalCalories =
    v.totalCalories === undefined
      ? dietPlan.reduce((sum, m) => sum + m.calories, 0)
      : toCalories(v.totalCalories, 'totalCalories');

  return {
    dietPlan,
    totalCalories,
    dailyAdvice: typeof v.dailyAdvice === 'string' ? v.dailyAdvice.trim().slice(0, 500) : '',
  };
};

/** Haftalık diyet planı yanıtını doğrula (7 gün, her günde en az 1 öğün) */
export const parseWeeklyDietPlan = (v: unknown): WeeklyDietPlan => {
  if (!isObject(v)) throw new InvalidAIResponseError('Yanıt bir nesne değil');
  if (!Array.isArray(v.days) || v.days.length === 0) {
    throw new InvalidAIResponseError('days: boş olmayan dizi bekleniyordu');
  }

  const days: DayPlan[] = v.days.map((d, i) => {
    const path = `days[${i}]`;
    if (!isObject(d)) throw new InvalidAIResponseError(`${path}: nesne bekleniyordu`);
    if (!Array.isArray(d.meals) || d.meals.length === 0) {
      throw new InvalidAIResponseError(`${path}.meals: boş olmayan dizi bekleniyordu`);
    }

    const meals = d.meals.map((m, j) => parseMeal(m, `${path}.meals[${j}]`));
    const dayNum = typeof d.day === 'number' && Number.isFinite(d.day) ? Math.round(d.day) : i + 1;

    return {
      day: dayNum,
      meals,
      totalCalories:
        d.totalCalories === undefined
          ? meals.reduce((sum, m) => sum + m.calories, 0)
          : toCalories(d.totalCalories, `${path}.totalCalories`),
    };
  });

  return { days };
};

/** Alternatif yemek önerisi — tek satırlık serbest metin */
export const parseAlternativeFood = (v: unknown): string => {
  const text = typeof v === 'string' ? v.trim() : '';
  if (!text) throw new InvalidAIResponseError('Boş alternatif yemek yanıtı');
  return text.slice(0, 300);
};
