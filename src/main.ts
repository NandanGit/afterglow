import "./style.css";
import { store } from "./store/store.ts";
import { exitCustomMode } from "./store/store.ts";
import { mountHeader } from "./ui/header.ts";
import { mountPaletteStrip } from "./ui/palette-strip.ts";
import { mountColorDisplay } from "./ui/color-display.ts";
import { mountPreview } from "./ui/preview.ts";
import { mountCustomBuilder } from "./ui/custom-builder.ts";
import { mountComparison } from "./ui/comparison.ts";
import { mountSearch } from "./ui/search.ts";
import { mountFontControls } from "./ui/font-controls.ts";
import { decodeThemeFromURL } from "./sharing/url.ts";
import { enterCustomMode } from "./store/store.ts";
import { hexToOklch, oklchToHex } from "./color/oklch.ts";
import { exportTheme, copyCssVars } from "./export/exporter.ts";
import { showModal, closeModal } from "./ui/modal.ts";
import { createElement, $ } from "./utils/dom.ts";
import type { Theme } from "./types/theme.ts";

const app = $("#app")! as HTMLElement;

// Root layout
app.innerHTML = `
  <header class="app-header" id="header"></header>
  <section class="palette-section" id="palette">
    <div class="palette-search-area" id="search-area"></div>
  </section>
  <main class="main-content">
    <div class="preview-panel" id="preview"></div>
    <div class="right-panel" id="right-panel">
      <div class="color-display" id="color-display"></div>
      <div class="custom-builder" id="custom-builder"></div>
      <div class="font-controls-container" id="font-controls"></div>
    </div>
  </main>
`;

// Get the effective active theme (custom or preset)
function getActiveTheme(): Theme | undefined {
  const state = store.getState();
  if (state.customModeActive && state.customTheme) return state.customTheme;
  return state.themes.get(state.activeThemeId);
}

// Apply theme CSS variables to :root
function applyThemeVars(theme: Theme): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    const cssVar = `--theme-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
    root.style.setProperty(cssVar, value as string);
  }
}

// Ambient background + theme accent
function updateAmbientBackground(theme: Theme): void {
  const oklch = hexToOklch(theme.colors.background);
  const ambientHex = oklchToHex({ L: 0.30, C: 0.06, H: oklch.H });
  document.documentElement.style.setProperty("--ambient-color", ambientHex);
  // Pick a vivid accent from the theme: prefer cyan, fallback to green
  document.documentElement.style.setProperty("--theme-accent", theme.colors.cyan);
}

const initialTheme = getActiveTheme();
if (initialTheme) {
  applyThemeVars(initialTheme);
  updateAmbientBackground(initialTheme);
}

store.subscribe((state, prev) => {
  const themeChanged =
    state.activeThemeId !== prev.activeThemeId ||
    state.customModeActive !== prev.customModeActive ||
    state.customTheme !== prev.customTheme;
  if (themeChanged) {
    const theme = state.customModeActive && state.customTheme
      ? state.customTheme
      : state.themes.get(state.activeThemeId);
    if (theme) {
      applyThemeVars(theme);
      updateAmbientBackground(theme);
    }
  }
});

// --- URL sharing: decode theme from URL on load ---
const urlParams = new URLSearchParams(window.location.search);
const themeParam = urlParams.get('theme');
if (themeParam) {
  const decoded = decodeThemeFromURL(themeParam);
  if (decoded) {
    enterCustomMode();
    const updates: Record<string, unknown> = {
      customTheme: decoded.theme,
      customModeActive: true,
    };
    if (decoded.controls) {
      updates.customControls = decoded.controls;
    }
    store.setState(updates);
  }
}

// Mount UI components
mountHeader($("#header")! as HTMLElement);
mountSearch($("#search-area")! as HTMLElement);
mountPaletteStrip($("#palette")! as HTMLElement);
mountColorDisplay($("#color-display")! as HTMLElement);
mountPreview($("#preview")! as HTMLElement);
mountCustomBuilder($("#custom-builder")! as HTMLElement);
mountComparison($("#preview")! as HTMLElement);
mountFontControls($("#font-controls")! as HTMLElement);

// --- Keyboard shortcuts ---
let lastNonZeroSpeed = 1;

document.addEventListener('keydown', (e: KeyboardEvent) => {
  // Disable shortcuts when typing in inputs
  const tag = (document.activeElement?.tagName ?? '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

  const state = store.getState();
  const themeIds = [...state.themes.keys()].filter(id => {
    const t = state.themes.get(id);
    return t && t.source === 'bundled';
  });
  const currentIdx = themeIds.indexOf(state.activeThemeId);

  switch (e.key) {
    case 'ArrowLeft': {
      e.preventDefault();
      if (currentIdx > 0) store.setState({ activeThemeId: themeIds[currentIdx - 1] });
      else if (themeIds.length > 0) store.setState({ activeThemeId: themeIds[themeIds.length - 1] });
      break;
    }
    case 'ArrowRight': {
      e.preventDefault();
      if (currentIdx < themeIds.length - 1) store.setState({ activeThemeId: themeIds[currentIdx + 1] });
      else if (themeIds.length > 0) store.setState({ activeThemeId: themeIds[0] });
      break;
    }
    case ' ': {
      e.preventDefault();
      if (state.speed === 0) {
        store.setState({ speed: lastNonZeroSpeed });
      } else {
        lastNonZeroSpeed = state.speed;
        store.setState({ speed: 0 });
      }
      break;
    }
    case 'e':
    case 'E': {
      const theme = getActiveTheme();
      if (theme) exportTheme(theme, 'terminal');
      break;
    }
    case 'c':
    case 'C': {
      const theme = getActiveTheme();
      if (theme) void copyCssVars(theme);
      break;
    }
    case '?': {
      showShortcutCheatsheet();
      break;
    }
    case '/': {
      e.preventDefault();
      const searchInput = $('#theme-search-input') as HTMLInputElement | null;
      if (searchInput) searchInput.focus();
      break;
    }
    case 'f':
    case 'F': {
      const favs = new Set(state.favorites);
      if (favs.has(state.activeThemeId)) favs.delete(state.activeThemeId);
      else favs.add(state.activeThemeId);
      store.setState({ favorites: favs });
      break;
    }
    case 'Escape': {
      // Priority: close modal > exit comparison > exit custom mode
      const modal = $('.modal-overlay');
      if (modal) { closeModal(); break; }
      if (state.comparisonEnabled) { store.setState({ comparisonEnabled: false }); break; }
      if (state.customModeActive) { exitCustomMode(); break; }
      break;
    }
  }
});

function showShortcutCheatsheet(): void {
  const content = createElement('div');
  content.innerHTML = `
    <table class="shortcut-table">
      <tr><td class="shortcut-key">←/→</td><td>Previous/Next theme</td></tr>
      <tr><td class="shortcut-key">Space</td><td>Pause/Resume</td></tr>
      <tr><td class="shortcut-key">E</td><td>Export .terminal</td></tr>
      <tr><td class="shortcut-key">C</td><td>Copy CSS variables</td></tr>
      <tr><td class="shortcut-key">F</td><td>Toggle favorite</td></tr>
      <tr><td class="shortcut-key">/</td><td>Focus search</td></tr>
      <tr><td class="shortcut-key">?</td><td>Show shortcuts</td></tr>
      <tr><td class="shortcut-key">Esc</td><td>Close/Exit</td></tr>
    </table>
  `;
  showModal({ title: 'Keyboard Shortcuts', content, closeLabel: 'Close' });
}
