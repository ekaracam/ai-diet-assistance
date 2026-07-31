/**
 * Gemini AI Service — Platform-agnostic
 *
 * İstemci hiçbir zaman Gemini'ye doğrudan gitmez; her çağrı Next.js API route'una
 * (`/api/gemini`) yapılır ve API anahtarı yalnızca sunucuda durur.
 */

import type { DietPlanResponse, WeeklyDietPlan } from '../types/diet';
import type { ChatMessage } from '../types/chat';
import { parseDietPlanResponse, parseWeeklyDietPlan, parseAlternativeFood } from '../utils/validation';

/**
 * API tabanını çöz.
 *
 * DİKKAT: Mobil derlemede `localhost` telefonun KENDİSİDİR — Next.js sunucusu değil.
 * Bu yüzden production'da adres yoksa sessizce yanlış yere istek atmak yerine
 * anlaşılır bir hata veriyoruz. Cihazda çalışacak build için `.env` içine
 * `EXPO_PUBLIC_API_URL=https://...` yazılmalı.
 */
const getApiUrl = (): string => {
  const explicit = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  // Web (Next.js istemcisi veya expo web): aynı origin üzerinden relative çalışır
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // Yalnızca yerel geliştirme: emülatör/simülatör Metro ile aynı makinede
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000';
  }

  throw new Error(
    'API adresi yapılandırılmamış. Mobil derleme için .env içine EXPO_PUBLIC_API_URL ekleyin.'
  );
};

const fetchGeminiApi = async <T>(
  action: string,
  payload: unknown,
  validate: (data: unknown) => T
): Promise<T> => {
  const url = `${getApiUrl()}/api/gemini`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
  } catch {
    // Ağ hatası: yanlış EXPO_PUBLIC_API_URL, sunucu kapalı veya cihaz çevrimdışı
    throw new Error(`Sunucuya ulaşılamadı (${url}). İnternet bağlantınızı kontrol edin.`);
  }

  // Sunucu HTML hata sayfası dönerse response.json() patlar — güvenli oku
  const raw = await response.text();
  let json: { data?: unknown; error?: string };
  try {
    json = JSON.parse(raw) as { data?: unknown; error?: string };
  } catch {
    throw new Error(`Sunucudan beklenmeyen yanıt (HTTP ${response.status}).`);
  }

  if (!response.ok || json.error) {
    throw new Error(json.error || `Sunucu hatası (HTTP ${response.status}).`);
  }

  return validate(json.data);
};

/** Günlük diyet planı oluştur */
export const generateDietPlan = async (
  targetCalories: number,
  goal: string,
  userData?: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
  }
): Promise<DietPlanResponse> =>
  fetchGeminiApi('generateDietPlan', { targetCalories, goal, userData }, parseDietPlanResponse);

/** Haftalık diyet planı oluştur */
export const generateWeeklyDietPlan = async (
  targetCalories: number,
  goal: string,
  userData?: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
  }
): Promise<WeeklyDietPlan> =>
  fetchGeminiApi('generateWeeklyDietPlan', { targetCalories, goal, userData }, parseWeeklyDietPlan);

/** Mevcut haftalık planı kullanıcı talebine göre düzenle */
export const modifyWeeklyDietPlan = async (
  currentPlan: WeeklyDietPlan,
  userRequest: string
): Promise<WeeklyDietPlan> =>
  fetchGeminiApi('modifyWeeklyDietPlan', { currentPlan, userRequest }, parseWeeklyDietPlan);

/** Alternatif yemek önerisi al */
export const getAlternativeFood = async (
  meal: string,
  currentFood: string,
  calories: number
): Promise<string> =>
  fetchGeminiApi('getAlternativeFood', { meal, currentFood, calories }, parseAlternativeFood);

/** Sohbet mesajı gönder */
export const sendChatMessage = async (
  messages: ChatMessage[],
  newMessage: string,
  userContext?: {
    targetCalories?: number | null;
    goal?: string;
    weight?: string;
    height?: string;
    age?: string;
  }
): Promise<string> =>
  // systemPrompt bilerek gönderilmiyor — sunucu kendi sabitini kullanır.
  fetchGeminiApi(
    'sendChatMessage',
    { messages, newMessage, userContext },
    (data) => {
      if (typeof data !== 'string' || !data.trim()) {
        throw new Error('Asistandan boş yanıt geldi.');
      }
      return data;
    }
  );
