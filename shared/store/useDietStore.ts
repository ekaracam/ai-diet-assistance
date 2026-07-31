/**
 * Diet Store — Unified state for user data, calculations, history, and water tracking
 * Platform-agnostic: storage backend injected at creation time
 */

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { UserFormData, HistoryEntry, CalculatedMetrics, UserGoal, Gender } from '../types/user';
import type { DietPlanResponse, WeeklyDietPlan } from '../types/diet';
import { calculateAllMetrics } from '../utils/calculations';
import { DEFAULT_FORM_DATA } from '../types/user';
import { getFirebaseAuth } from '../services/firebaseConfig';
import {
  saveUserProfile,
  getUserProfile,
  saveWeeklyDietPlan,
  getWeeklyDietPlan,
  saveHistoryEntry,
  getHistoryEntries,
} from '../services/firestoreService';

/**
 * Profil yazımı için debounce.
 *
 * setUserData formda her tuş vuruşunda çağrılıyor; debounce olmadan "72.5" yazmak
 * 4 ayrı Firestore write demekti. Son değişiklikten PROFILE_SAVE_DELAY_MS sonra
 * tek bir yazım yapılır.
 */
const PROFILE_SAVE_DELAY_MS = 800;
let profileSaveTimer: ReturnType<typeof setTimeout> | null = null;

interface DietState extends CalculatedMetrics {
  // User data (form)
  userData: UserFormData;
  setUserData: (data: Partial<UserFormData>) => void;

  // History
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  setHistory: (history: HistoryEntry[]) => void;

  // Water tracking
  waterGlasses: number;
  waterGoal: number;
  addWaterGlass: () => void;
  removeWaterGlass: () => void;
  resetWater: () => void;

  // Current diet plan
  currentDietPlan: DietPlanResponse | null;
  setDietPlan: (plan: DietPlanResponse | null) => void;

  // Weekly diet plan
  weeklyDietPlan: WeeklyDietPlan | null;
  weeklyPlanStartDate: string | null;
  setWeeklyDietPlan: (plan: WeeklyDietPlan | null) => void;

  // Internal
  calculateMetrics: () => void;
  saveDailyWeight: () => void;
  resetStore: () => void;
  loadUserDataFromFirestore: (userId: string) => Promise<void>;
  _isLoaded: boolean;
  _isLoadingFromFirestore: boolean;
}

/**
 * Store factory — storage parametresi ile platform-agnostic
 * Mobil: AsyncStorage, Web: localStorage
 */
export const createDietStore = (storage: StateStorage) =>
  create<DietState>()(
    persist(
      (set, get) => ({
        // ── Initial State ──
        userData: { ...DEFAULT_FORM_DATA },

        bmr: null,
        tdee: null,
        bmi: null,
        bodyFatPercentage: null,
        targetCalories: null,

        history: [],
        waterGlasses: 0,
        waterGoal: 8,
        currentDietPlan: null,
        weeklyDietPlan: null,
        weeklyPlanStartDate: null,
        _isLoaded: false,
        _isLoadingFromFirestore: false,

        // ── Actions ──

        setUserData: (data) => {
          set((state) => ({
            userData: { ...state.userData, ...data },
          }));

          // Metrikler senkron hesaplanır — arayüz anında güncel kalsın
          get().calculateMetrics();

          // Firestore yazımı debounce edilir (bkz. PROFILE_SAVE_DELAY_MS)
          if (profileSaveTimer) clearTimeout(profileSaveTimer);
          profileSaveTimer = setTimeout(() => {
            profileSaveTimer = null;
            const auth = getFirebaseAuth();
            if (auth.currentUser && get()._isLoaded) {
              saveUserProfile(auth.currentUser.uid, get().userData).catch(console.error);
            }
          }, PROFILE_SAVE_DELAY_MS);
        },

        addHistoryEntry: (entry) => {
          set((state) => ({
            history: [...state.history, entry],
          }));
        },

        setHistory: (history) => set({ history }),

        addWaterGlass: () => {
          set((state) => ({ waterGlasses: state.waterGlasses + 1 }));
        },

        removeWaterGlass: () => {
          set((state) => ({ waterGlasses: Math.max(0, state.waterGlasses - 1) }));
        },

        resetWater: () => set({ waterGlasses: 0 }),

        setDietPlan: (plan) => set({ currentDietPlan: plan }),

        setWeeklyDietPlan: (plan) => {
          const startDate = plan ? new Date().toISOString() : null;
          set({ 
            weeklyDietPlan: plan, 
            weeklyPlanStartDate: startDate 
          });
          const auth = getFirebaseAuth();
          if (auth.currentUser && plan && startDate) {
            saveWeeklyDietPlan(auth.currentUser.uid, plan, startDate).catch(console.error);
          }
        },

        calculateMetrics: () => {
          const { userData } = get();
          const metrics = calculateAllMetrics(
            userData.gender,
            userData.age,
            userData.height,
            userData.weight,
            userData.neck,
            userData.waist,
            userData.hip,
            userData.activityLevel,
            userData.goal
          );
          set(metrics);
        },

        saveDailyWeight: () => {
          const { userData, bodyFatPercentage, history } = get();
          const weight = parseFloat((userData.weight || '').replace(',', '.'));
          if (!Number.isFinite(weight) || weight <= 0) return;

          const today = new Date().toISOString().split('T')[0];
          const existingIndex = history.findIndex((h) => h.date.startsWith(today));

          const newEntry: HistoryEntry = {
            date: new Date().toISOString(),
            weight,
            bodyFatPercentage: bodyFatPercentage || 0,
          };

          if (existingIndex >= 0) {
            const newHistory = [...history];
            newHistory[existingIndex] = newEntry;
            set({ history: newHistory });
          } else {
            set({ history: [...history, newEntry] });
          }

          // Buluta da yaz — aksi halde uygulama silinince/cihaz değişince geçmiş kaybolur
          const auth = getFirebaseAuth();
          if (auth.currentUser) {
            saveHistoryEntry(auth.currentUser.uid, newEntry).catch(console.error);
          }
        },

        loadUserDataFromFirestore: async (userId: string) => {
          set({ _isLoadingFromFirestore: true });
          try {
            const profile = await getUserProfile(userId);
            
            const auth = getFirebaseAuth();
            let mergedProfile = profile ? { ...DEFAULT_FORM_DATA, ...profile } : { ...DEFAULT_FORM_DATA };
            if (auth.currentUser) {
              if (!mergedProfile.email) mergedProfile.email = auth.currentUser.email || '';
              if (!mergedProfile.name) mergedProfile.name = auth.currentUser.displayName || '';
            }

            set({ userData: mergedProfile, _isLoaded: true, _isLoadingFromFirestore: false });

            // Plan ve geçmiş birbirine bağlı değil — paralel çek
            const [weeklyData, history] = await Promise.all([
              getWeeklyDietPlan(userId),
              getHistoryEntries(userId).catch((e) => {
                console.error('Geçmiş yüklenemedi:', e);
                return [] as HistoryEntry[];
              }),
            ]);

            if (weeklyData) {
              set({
                weeklyDietPlan: weeklyData.plan,
                weeklyPlanStartDate: weeklyData.startDate,
              });
            }
            if (history.length > 0) {
              set({ history });
            }
            get().calculateMetrics();
          } catch (error) {
            console.error('Error loading user data from Firestore:', error);
            set({ _isLoadingFromFirestore: false });
          }
        },

        resetStore: () => {
          // Bekleyen profil yazımını iptal et — aksi halde çıkış yaptıktan sonra
          // sıfırlanmış (boş) profil önceki kullanıcının dokümanına yazılabilir
          if (profileSaveTimer) {
            clearTimeout(profileSaveTimer);
            profileSaveTimer = null;
          }
          set({
            userData: { ...DEFAULT_FORM_DATA },
            bmr: null,
            tdee: null,
            bmi: null,
            bodyFatPercentage: null,
            targetCalories: null,
            history: [],
            waterGlasses: 0,
            currentDietPlan: null,
            weeklyDietPlan: null,
            weeklyPlanStartDate: null,
            _isLoaded: false,
            _isLoadingFromFirestore: false,
          });
        },
      }),
      {
        name: 'ai-diet-storage',
        storage: createJSONStorage(() => storage),
        partialize: (state) => ({
          userData: state.userData,
          bmr: state.bmr,
          tdee: state.tdee,
          bmi: state.bmi,
          bodyFatPercentage: state.bodyFatPercentage,
          targetCalories: state.targetCalories,
          history: state.history,
          waterGlasses: state.waterGlasses,
          waterGoal: state.waterGoal,
          currentDietPlan: state.currentDietPlan,
          weeklyDietPlan: state.weeklyDietPlan,
          weeklyPlanStartDate: state.weeklyPlanStartDate,
        }),
      }
    )
  );
