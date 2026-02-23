import "./style.css";
import { store } from "./store/store.ts";
import { mountHeader } from "./ui/header.ts";
import { mountPaletteStrip } from "./ui/palette-strip.ts";
import { mountColorDisplay } from "./ui/color-display.ts";
import { mountPreview } from "./ui/preview.ts";

const app = document.getElementById("app")!;

// Root layout
app.innerHTML = `
  <header class="app-header" id="header"></header>
  <section class="palette-section" id="palette"></section>
  <main class="main-content">
    <div class="preview-panel" id="preview"></div>
    <div class="right-panel" id="right-panel">
      <div class="color-display" id="color-display"></div>
      <div class="custom-builder" id="custom-builder"></div>
    </div>
  </main>
`;

// Apply theme CSS variables to :root
function applyThemeVars(themeId: string): void {
  const theme = store.getState().themes.get(themeId);
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    const cssVar = `--theme-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
    root.style.setProperty(cssVar, value as string);
  }
  // Ambient glow: use a blend of theme accent colors for a visible but subtle glow
  const c = theme.colors;
  const glowColor =
    c.selection || c.cyan || c.blue || c.green || c.magenta || c.text;
  root.style.setProperty("--ambient-color", glowColor);
}

applyThemeVars(store.getState().activeThemeId);
store.subscribe((state) => applyThemeVars(state.activeThemeId));

// Mount UI components
mountHeader(document.getElementById("header")!);
mountPaletteStrip(document.getElementById("palette")!);
mountColorDisplay(document.getElementById("color-display")!);
mountPreview(document.getElementById("preview")!);
