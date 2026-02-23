import { createStore } from 'zustand/vanilla';
import type { Theme, ColorSlotId, AnsiNormalSlot } from '../types/theme.ts';
import { bundledThemes } from '../themes/bundled.ts';

export type ScenarioId = 'all' | 'git' | 'python' | 'logs' | 'system' | 'docker' | 'files' | 'build' | 'ssh';

export interface CustomControls {
  hue: number;
  warmth: number;
  saturation: number;
  contrast: number;
}

export interface AppState {
  activeThemeId: string;
  themes: Map<string, Theme>;
  customTheme: Theme | null;
  customControls: CustomControls;
  pinnedColors: Set<ColorSlotId>;
  locks: Record<AnsiNormalSlot, boolean>;
  globalLock: boolean;
  customModeActive: boolean;
  activeScenario: ScenarioId;
  speed: number;
  looping: boolean;
  comparisonEnabled: boolean;
  comparisonThemeId: string | null;
  sliderPosition: number;
  favorites: Set<string>;
  fontSize: number;
  fontFamily: string;
  registryStatus: 'idle' | 'loading' | 'loaded' | 'error';
  communityThemeIds: string[];
  activeTab: 'handcrafted' | 'community';
  searchQuery: string;
}

// --- localStorage helpers ---

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function loadNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return Number(raw);
  } catch { /* ignore */ }
  return fallback;
}

function loadString(key: string, fallback: string): string {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return raw;
  } catch { /* ignore */ }
  return fallback;
}

// --- Store ---

const initialLocks: Record<AnsiNormalSlot, boolean> = {
  black: false,
  red: false,
  green: false,
  yellow: false,
  blue: false,
  magenta: false,
  cyan: false,
  white: false,
};

export const store = createStore<AppState>()(() => ({
  activeThemeId: 'understory',
  themes: bundledThemes,
  customTheme: null,
  customControls: { hue: 180, warmth: 0, saturation: 0.5, contrast: 0.5 },
  pinnedColors: new Set(),
  locks: { ...initialLocks },
  globalLock: false,
  customModeActive: false,
  activeScenario: 'all' as ScenarioId,
  speed: 1,
  looping: true,
  comparisonEnabled: false,
  comparisonThemeId: null,
  sliderPosition: 50,
  favorites: loadSet('afterglow-favorites'),
  fontSize: loadNumber('afterglow-fontSize', 14),
  fontFamily: loadString('afterglow-fontFamily', 'JetBrains Mono'),
  registryStatus: 'idle',
  communityThemeIds: [],
  activeTab: 'handcrafted',
  searchQuery: '',
}));

// --- Persist preferences to localStorage ---

store.subscribe((state, prev) => {
  if (state.favorites !== prev.favorites) {
    localStorage.setItem('afterglow-favorites', JSON.stringify([...state.favorites]));
  }
  if (state.fontSize !== prev.fontSize) {
    localStorage.setItem('afterglow-fontSize', String(state.fontSize));
  }
  if (state.fontFamily !== prev.fontFamily) {
    localStorage.setItem('afterglow-fontFamily', state.fontFamily);
  }
});
