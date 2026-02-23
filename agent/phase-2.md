# Phase 2: Theme Data

> **Prerequisites**: Phase 1 (Foundation) must be complete
> **Read first**: `agent/PLAN.md` for full project context
> **After completing**: Update `STATUS.md` Phase 2 to ✅

## Overview

Load the existing handcrafted theme data into the app. The 16 theme JSON files already exist in `themes/bundled/` and the master registry is at `themes/registry.json` (the single source of truth for all theme metadata). This phase implements the bundled theme loader, the registry reader, and expands `main.ts` to initialize the app with the root layout structure.

## Before You Start

1. Ensure `npm run dev` is running
2. Check `STATUS.md` confirms Phase 1 is ✅
3. Verify `themes/bundled/` contains 16 JSON files and `themes/registry.json` exists

## Tasks

### 2.1 Implement `src/themes/bundled.ts`

Statically import all 16 theme JSON files from `themes/bundled/` and export them as a `Map<string, Theme>`:

```typescript
import understory from '../../themes/bundled/understory.json';
import voidOrchid from '../../themes/bundled/void-orchid.json';
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

### 2.2 Implement `src/themes/registry.ts`

Create a registry reader that treats `themes/registry.json` as the source of truth. Bundled themes are preloaded at build time; community themes are loaded on-demand from jsDelivr.

```typescript
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/NandanGit/afterglow@main/themes';

export interface RegistryEntry {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
}

export interface Registry {
  version: number;
  bundledThemes: RegistryEntry[];
  communityThemes: RegistryEntry[];
}

// Fetch registry from jsDelivr (with localStorage caching, 1hr TTL)
export async function fetchRegistry(): Promise<Registry>;

// Fetch a single community theme JSON from jsDelivr
// URL: ${JSDELIVR_BASE}/community/${id}.json
export async function fetchCommunityTheme(id: string): Promise<Theme>;
```

The registry is fetched on-demand when the Community tab is opened (not at app startup). Bundled themes are always available via static imports.

### 2.3 Update `src/store/store.ts`

Update the store initialization to load bundled themes:
- Import `bundledThemes` from `themes/bundled.ts`
- Set `themes: bundledThemes` in initial state
- Set `activeThemeId: 'understory'` as default

### 2.4 Update `src/main.ts` — Root Layout

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
4. All 16 bundled themes are loaded from `themes/bundled/` and available in the store
5. `themes/registry.json` structure matches the bundled theme set

## Files Created/Modified

- **Created**: `src/themes/bundled.ts`, `src/themes/registry.ts`
- **Modified**: `src/store/store.ts`, `src/main.ts`, `src/style.css`, possibly `tsconfig.json`
- **Pre-existing (not modified)**: `themes/bundled/*.json` (16 files), `themes/registry.json`
