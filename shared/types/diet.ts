/** Tek bir öğün (API yanıtı) */
export interface DietMeal {
  meal: string;
  food: string;
  calories: number;
}

/** Diyet planı API yanıtı */
export interface DietPlanResponse {
  dietPlan: DietMeal[];
  totalCalories: number;
  dailyAdvice: string;
}

/** Kaydedilmiş diyet planı */
export interface SavedDietPlan {
  id: string;
  userId: string;
  date: string;
  plan: DietPlanResponse;
  createdAt: string;
}

/** Haftalık Diyet Planı Öğesi */
export interface DayPlan {
  day: number; // 1 to 7
  meals: DietMeal[];
  totalCalories: number;
}

/** Haftalık Diyet Planı */
export interface WeeklyDietPlan {
  days: DayPlan[];
}

/** Öğün ikonları mapping */
export const MEAL_KEYS = ['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği', 'Ara Öğün'] as const;
