// Types — Barrel export
export type {
  Gender,
  ActivityLevel,
  UserGoal,
  UserProfile,
  UserFormData,
  HistoryEntry,
  CalculatedMetrics,
} from './user';

export {
  ACTIVITY_MULTIPLIERS,
  ACTIVITY_LABELS,
  GOAL_LABELS,
  DEFAULT_FORM_DATA,
} from './user';

export type {
  MessageRole,
  ChatMessage,
  ChatSession,
} from './chat';

export {
  CHAT_SUGGESTIONS,
  DIET_SYSTEM_PROMPT,
} from './chat';

export type {
  DietMeal,
  DietPlanResponse,
  SavedDietPlan,
} from './diet';

export { MEAL_KEYS } from './diet';
