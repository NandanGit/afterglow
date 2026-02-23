# Phase 2: Theme Data

> **Prerequisites**: Phase 1 (Foundation) must be complete
> **Read first**: `agent/PLAN.md` for full project context
> **After completing**: Update `STATUS.md` Phase 2 to ✅

## Overview

Create all 16 handcrafted theme JSON files, the registry index, the bundled theme loader, and expand `main.ts` to initialize the app with the root layout structure.

## Before You Start

1. Ensure `npm run dev` is running
2. Check `STATUS.md` confirms Phase 1 is ✅

## Tasks

### 2.1 Create `themes/` Directory and Theme JSON Files

Create a `themes/` directory at the **repo root** (not inside `src/`). Create 16 theme JSON files, each following this format:

```json
{
  "id": "theme-id",
  "name": "Theme Name",
  "subtitle": "Short description · secondary detail · tertiary detail",
  "emoji": "🎨",
  "colors": {
    "background": "#XXXXXX",
    "text": "#XXXXXX",
    "bold": "#XXXXXX",
    "selection": "#XXXXXX",
    "cursor": "#XXXXXX",
    "cursorText": "#XXXXXX",
    "black": "#XXXXXX",
    "red": "#XXXXXX",
    "green": "#XXXXXX",
    "yellow": "#XXXXXX",
    "blue": "#XXXXXX",
    "magenta": "#XXXXXX",
    "cyan": "#XXXXXX",
    "white": "#XXXXXX",
    "brightBlack": "#XXXXXX",
    "brightRed": "#XXXXXX",
    "brightGreen": "#XXXXXX",
    "brightYellow": "#XXXXXX",
    "brightBlue": "#XXXXXX",
    "brightMagenta": "#XXXXXX",
    "brightCyan": "#XXXXXX",
    "brightWhite": "#XXXXXX"
  }
}
```

The 16 themes to create (filenames = `{id}.json`):

1. **understory** — 🌿 Understory — "Forest floor · warm moss · dappled light" — Dark green/brown bg, warm earthy tones
2. **void-orchid** — 🪻 Void Orchid — "Deep purple-black · amethyst accents" — Very dark purple bg, purple/pink ANSI
3. **ember** — 🔥 Ember — "Near-black · amber and flame" — Dark charcoal bg, warm red/orange/amber palette
4. **arctic** — 🧊 Arctic — "Deep glacial blue · frost and ice" — Dark blue-gray bg, cool blue/cyan/white palette
5. **sakura-dusk** — 🌸 Sakura Dusk — "Warm gray-dark · cherry blossom" — Dark warm gray, pink/rose accent palette
6. **copper-mill** — ⚙️ Copper Mill — "Industrial dark · copper and steel" — Dark brown/gray, copper/bronze tones
7. **deep-ocean** — 🐋 Deep Ocean — "Dark teal-black · ocean depths" — Very dark teal bg, aquatic blues/greens
8. **noir** — 🎬 Noir — "Near-black neutral · crisp contrast" — Pure near-black bg, high contrast, desaturated palette
9. **desert-night** — 🏜️ Desert Night — "Sandy dark · warm ochre tones" — Dark sand bg, warm yellows/oranges
10. **tidal-pool** — 🌊 Tidal Pool — "Aquamarine dark · sandy warm accents" — Dark aqua bg, teal/sand tones
11. **merlot** — 🍷 Merlot — "Deep wine-red · cream and berry" — Very dark red bg, wine/berry ANSI palette
12. **moss-garden** — 🌿 Moss Garden — "Olive-green dark · stone and earth" — Dark olive bg, earthy organic tones
13. **nebula** — 🔮 Nebula — "Deep indigo-violet · electric accents" — Dark indigo bg, vibrant blue/pink/purple
14. **slate-peak** — 🏔️ Slate Peak — "Cool blue-gray · crisp steel" — Dark blue-gray bg, cool muted palette
15. **seville** — 🍊 Seville — "Warm dark brown · golden citrus" — Dark brown bg, orange/gold palette
16. **moonstone** — 🌙 Moonstone — "Silver-blue dark · pearlescent cool" — Dark silver-blue bg, cool pastel accents

**Guidelines for crafting colors:**
- Background should be very dark (lightness 0.10–0.18 in OKLCH)
- Text (foreground) should be high contrast against background (aim for WCAG AA)
- Bold should be slightly brighter than text
- All 16 ANSI colors should be distinguishable from each other and readable against the background
- Normal ANSI colors should be moderately saturated; brights should be lighter/more vivid versions
- Each theme should feel cohesive — all colors should belong to the same aesthetic "family"
- Use the color generation algorithm in PLAN.md as a starting guide, then hand-tune for quality

**Refer to the mockup** (`theme-builder-mockup.jpeg`) for the Understory palette — match those colors as closely as possible. The mockup shows:
- Background: `#1A1F18`
- Text: `#D4CDBF`
- Bold: `#EDE8DC`
- Selection: `#2D4A2A`
- Cyan: `#6AAF96`

### 2.2 Create `themes/registry.json`

```json
{
  "version": 1,
  "themes": [
    { "id": "understory", "name": "Understory", "subtitle": "Forest floor · warm moss · dappled light", "emoji": "🌿" },
    { "id": "void-orchid", "name": "Void Orchid", "subtitle": "Deep purple-black · amethyst accents", "emoji": "🪻" },
    ...all 16...
  ]
}
```

### 2.3 Implement `src/themes/bundled.ts`

Statically import all 16 theme JSON files and export them as a `Map<string, Theme>`:

```typescript
import understory from '../../themes/understory.json';
import voidOrchid from '../../themes/void-orchid.json';
// ... all 16

import type { Theme } from '../types/theme';

// Add source: 'bundled' to each
const addSource = (t: any): Theme => ({ ...t, source: 'bundled' as const });

export const bundledThemes: Map<string, Theme> = new Map([
  ['understory', addSource(understory)],
  ['void-orchid', addSource(voidOrchid)],
  // ... all 16
]);
```

You may need to add `"resolveJsonModule": true` to `tsconfig.json` if not already present.

### 2.4 Update `src/store/store.ts`

Update the store initialization to load bundled themes:
- Import `bundledThemes` from `themes/bundled.ts`
- Set `themes: bundledThemes` in initial state
- Set `activeThemeId: 'understory'` as default

### 2.5 Update `src/main.ts` — Root Layout

Expand `main.ts` to create the root DOM structure:

```typescript
import './style.css';
import { store } from './store/store';

const app = document.getElementById('app')!;

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

// Apply initial theme CSS variables
function applyThemeVars(themeId: string) {
  const theme = store.getState().themes.get(themeId);
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--theme-${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`, value);
  }
}

applyThemeVars(store.getState().activeThemeId);
store.subscribe((state) => applyThemeVars(state.activeThemeId));
```

Add corresponding CSS layout rules in `style.css`.

## Verification

1. `npm run dev` shows the skeletal layout with the correct dark background
2. Browser DevTools → Elements → `<html>` element has `--theme-background`, `--theme-text`, etc. CSS variables set to Understory's colors
3. `npm run build` succeeds with no TypeScript errors
4. All 16 JSON files are valid and parseable

## Files Created/Modified

- **Created**: `themes/*.json` (16 files), `themes/registry.json`, `src/themes/bundled.ts`
- **Modified**: `src/store/store.ts`, `src/main.ts`, `src/style.css`, possibly `tsconfig.json`
