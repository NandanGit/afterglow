import { createStore } from "zustand/vanilla";
import type {
  Theme,
  ColorSlotId,
  AnsiNormalSlot,
  ThemeColors,
} from "../types/theme.ts";
import { NORMAL_TO_BRIGHT } from "../types/theme.ts";
import { bundledThemes } from "../themes/bundled.ts";
import { generatePalette } from "../color/generator.ts";
import { deriveBright } from "../color/derive.ts";
import type { ScenarioId } from "../simulator/scenarios/index.ts";

export type { ScenarioId };

export interface CustomControls {
  hue: number;
  warmth: number;
  saturation: number;
  contrast: number;
  brightness: number; // 0 (dark) to 1 (light), step 0.1
}

export interface AppState {
  activeThemeId: string;
  themes: Map<string, Theme>;
  customTheme: Theme | null;
  customControls: CustomControls;
  pinnedColors: Set<ColorSlotId>;
  locks: Record<AnsiNormalSlot, boolean>;
  globalLock: boolean;
  lockedControls: Set<keyof CustomControls>;
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
  registryStatus: "idle" | "loading" | "loaded" | "error";
  communityThemeIds: string[];
  activeTab: "handcrafted" | "community";
  searchQuery: string;
}

// --- localStorage helpers ---

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

function loadNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return Number(raw);
  } catch {
    /* ignore */
  }
  return fallback;
}

function loadString(key: string, fallback: string): string {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return raw;
  } catch {
    /* ignore */
  }
  return fallback;
}

function loadBoolean(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return raw === "true";
  } catch {
    /* ignore */
  }
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
  activeThemeId: "understory",
  themes: bundledThemes,
  customTheme: null,
  customControls: {
    hue: 180,
    warmth: 0,
    saturation: 0.5,
    contrast: 0.5,
    brightness: 0.2,
  },
  pinnedColors: new Set(),
  locks: { ...initialLocks },
  globalLock: false,
  lockedControls: loadSet("afterglow-lockedControls") as Set<
    keyof CustomControls
  >,
  customModeActive: false,
  activeScenario: loadString("afterglow-activeScenario", "all") as ScenarioId,
  speed: loadNumber("afterglow-speed", 1),
  looping: loadBoolean("afterglow-looping", true),
  comparisonEnabled: false,
  comparisonThemeId: null,
  sliderPosition: 50,
  favorites: loadSet("afterglow-favorites"),
  fontSize: loadNumber("afterglow-fontSize", 14),
  fontFamily: loadString("afterglow-fontFamily", "JetBrains Mono"),
  registryStatus: "idle",
  communityThemeIds: [],
  activeTab: "handcrafted",
  searchQuery: "",
}));

// --- Persist preferences to localStorage ---

store.subscribe((state, prev) => {
  if (state.favorites !== prev.favorites) {
    localStorage.setItem(
      "afterglow-favorites",
      JSON.stringify([...state.favorites]),
    );
  }
  if (state.fontSize !== prev.fontSize) {
    localStorage.setItem("afterglow-fontSize", String(state.fontSize));
  }
  if (state.fontFamily !== prev.fontFamily) {
    localStorage.setItem("afterglow-fontFamily", state.fontFamily);
  }
  if (state.lockedControls !== prev.lockedControls) {
    localStorage.setItem(
      "afterglow-lockedControls",
      JSON.stringify([...state.lockedControls]),
    );
  }
  if (state.activeScenario !== prev.activeScenario) {
    localStorage.setItem("afterglow-activeScenario", state.activeScenario);
  }
  if (state.speed !== prev.speed) {
    localStorage.setItem("afterglow-speed", String(state.speed));
  }
  if (state.looping !== prev.looping) {
    localStorage.setItem("afterglow-looping", String(state.looping));
  }
});

// --- Store actions ---

const allLocksOn: Record<AnsiNormalSlot, boolean> = {
  black: true,
  red: true,
  green: true,
  yellow: true,
  blue: true,
  magenta: true,
  cyan: true,
  white: true,
};

export function enterCustomMode(): void {
  const state = store.getState();
  const activeTheme = state.themes.get(state.activeThemeId);
  if (!activeTheme) return;

  const controls: CustomControls = {
    hue: 180,
    warmth: 0,
    saturation: 0.5,
    contrast: 0.5,
    brightness: 0.2,
  };
  const colors = generatePalette(controls);

  store.setState({
    customModeActive: true,
    customTheme: {
      id: "custom",
      name: "Custom Theme",
      subtitle: "Your custom palette",
      emoji: "🎨",
      colors,
      source: "custom",
    },
    customControls: controls,
    pinnedColors: new Set(),
    locks: { ...allLocksOn },
    globalLock: true,
  });
}

export function exitCustomMode(): void {
  store.setState({
    customModeActive: false,
    customTheme: null,
  });
}

export function setCustomControl(
  key: keyof CustomControls,
  value: number,
): void {
  const state = store.getState();
  const newControls = { ...state.customControls, [key]: value };
  store.setState({ customControls: newControls });
  regeneratePalette(newControls);
}

export function setCustomControls(controls: CustomControls): void {
  store.setState({ customControls: controls, pinnedColors: new Set() });
  regeneratePalette(controls);
}

export function regeneratePalette(controlsOverride?: CustomControls): void {
  const state = store.getState();
  if (!state.customTheme) return;

  const controls = controlsOverride ?? state.customControls;
  const generated = generatePalette(controls);
  const current = state.customTheme.colors;
  const pinned = state.pinnedColors;

  const colors: ThemeColors = { ...generated };
  for (const slot of pinned) {
    colors[slot] = current[slot];
  }

  // Apply locks: derive bright from normal
  const normalSlots: AnsiNormalSlot[] = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
  ];
  for (const ns of normalSlots) {
    if (state.locks[ns]) {
      const brightSlot = NORMAL_TO_BRIGHT[ns];
      if (!pinned.has(brightSlot)) {
        colors[brightSlot] = deriveBright(colors[ns]);
      }
    }
  }

  store.setState({
    customTheme: { ...state.customTheme, colors },
  });
}

export function editColor(slot: ColorSlotId, hex: string): void {
  const state = store.getState();
  if (!state.customTheme) return;

  const newColors = { ...state.customTheme.colors, [slot]: hex };
  const newPinned = new Set(state.pinnedColors);
  newPinned.add(slot);

  // If editing a normal slot and its lock is engaged, derive the bright
  const normalSlots: AnsiNormalSlot[] = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
  ];
  if (normalSlots.includes(slot as AnsiNormalSlot)) {
    const ns = slot as AnsiNormalSlot;
    if (state.locks[ns]) {
      const brightSlot = NORMAL_TO_BRIGHT[ns];
      newColors[brightSlot] = deriveBright(hex);
    }
  }

  store.setState({
    customTheme: { ...state.customTheme, colors: newColors },
    pinnedColors: newPinned,
  });
}

export function togglePin(slot: ColorSlotId): void {
  const state = store.getState();
  const newPinned = new Set(state.pinnedColors);
  if (newPinned.has(slot)) {
    newPinned.delete(slot);
    store.setState({ pinnedColors: newPinned });
    regeneratePalette();
  } else {
    newPinned.add(slot);
    store.setState({ pinnedColors: newPinned });
  }
}

export function toggleLock(slot: AnsiNormalSlot): void {
  const state = store.getState();
  const newLocks = { ...state.locks, [slot]: !state.locks[slot] };
  const allOn = Object.values(newLocks).every(Boolean);
  store.setState({ locks: newLocks, globalLock: allOn });

  // If locking on, derive bright from current normal
  if (!state.locks[slot] && state.customTheme) {
    const brightSlot = NORMAL_TO_BRIGHT[slot];
    const newColors = { ...state.customTheme.colors };
    newColors[brightSlot] = deriveBright(newColors[slot]);
    store.setState({
      customTheme: { ...state.customTheme, colors: newColors },
    });
  }
}

export function toggleGlobalLock(): void {
  const state = store.getState();
  const anyOff = Object.values(state.locks).some((v) => !v);
  const newLocks = anyOff ? { ...allLocksOn } : { ...initialLocks };
  store.setState({ locks: newLocks, globalLock: anyOff });
}

export function setCustomThemeName(name: string): void {
  const state = store.getState();
  if (!state.customTheme) return;
  store.setState({
    customTheme: { ...state.customTheme, name: name || "Custom Theme" },
  });
}

export function toggleControlLock(key: keyof CustomControls): void {
  const state = store.getState();
  const newLocked = new Set(state.lockedControls);
  if (newLocked.has(key)) {
    newLocked.delete(key);
  } else {
    newLocked.add(key);
  }
  store.setState({ lockedControls: newLocked });
}
