/**
 * Shared Color Tokens — Premium Dark Theme
 * Used by both React Native and Next.js
 */

export const colors = {
  // ── Core Palette (Dark) ──
  obsidian: {
    deep: '#05070A',
    base: '#0D1117',
    elevated: '#161B22',
    surface: '#1C2128',
  },

  // ── Accent Colors ──
  accent: {
    emerald: '#00FF87',
    mint: '#60EFFF',
    gold: '#FFD700',
    rose: '#FF4757',
  },

  // ── Text Colors ──
  text: {
    primary: '#EDEDED',
    secondary: '#8B949E',
    muted: '#484F58',
    inverse: '#05070A',
  },

  // ── Glass System (for opacity-based backgrounds) ──
  glass: {
    bg: 'rgba(13, 17, 23, 0.6)',
    bgHeavy: 'rgba(13, 17, 23, 0.85)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
  },

  // ── Semantic ──
  success: '#00FF87',
  warning: '#FFD700',
  error: '#FF4757',
  info: '#60EFFF',

  // ── Tab Bar ──
  tabBar: {
    bg: '#0D1117',
    border: 'rgba(255, 255, 255, 0.06)',
    active: '#00FF87',
    inactive: '#484F58',
  },
} as const;

/** Gradient tanımları */
export const gradients = {
  emeraldMint: ['#00FF87', '#60EFFF'],
  emeraldGold: ['#00FF87', '#FFD700'],
  obsidian: ['#161B22', '#0D1117', '#05070A'],
  card: ['rgba(13, 17, 23, 0.5)', 'rgba(13, 17, 23, 0.8)'],
} as const;

/** Glow / Shadow değerleri */
export const glows = {
  emerald: '0 0 30px rgba(0, 255, 135, 0.3)',
  emeraldIntense: '0 0 60px rgba(0, 255, 135, 0.4), 0 0 120px rgba(0, 255, 135, 0.1)',
  mint: '0 0 30px rgba(96, 239, 255, 0.3)',
  gold: '0 0 30px rgba(255, 215, 0, 0.3)',
} as const;
