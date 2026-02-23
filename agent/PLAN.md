# Terminal Theme Builder — Master Plan

> **For agents**: Read this file first for full context. Then read the phase file you're assigned (e.g., `phase-1.md`). Check `../STATUS.md` to see what's done. Run `npm run dev` before starting work and keep it running so the user can see changes live.

---

## Project Overview

A browser-based **Terminal Theme Builder** built with Vite + TypeScript (no frameworks, no UI libraries). It lets users browse 16 handcrafted terminal themes, preview them with animated terminal simulations, build custom themes from a single hue, and export to macOS `.terminal` files.

**Repo root**: The project root contains `index.html`, `package.json`, `tsconfig.json`, and a `src/` folder. All existing Vite boilerplate in `src/` must be deleted and replaced (Phase 1).

**Visual reference**: `theme-builder-mockup.jpeg` in repo root is the design mockup. Match it closely.

---

## Technical Constraints (Non-negotiable)

- Vite + TypeScript, `strict: true`, no `any`
- No frameworks (no React, Vue, etc.)
- No UI libraries (no Material, Tailwind, etc.)
- State management: `zustand/vanilla` (`createStore`)
- One central Zustand store for all shared state
- Must run correctly with `npm run dev`
- Target desktop viewports ≥ 1280px; no mobile
- JetBrains Mono (Google Fonts) as primary monospace font
- Always run `npm run dev` during development

---

## Agreed Design Decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Color model | OKLCH internally, hex (#RRGGBB) for export/storage/display |
| 2 | Pinned colors | Auto-pin on manual edit, click pin icon to unpin |
| 3 | Normal↔Bright locks | Per-slot (8 individual) + global lock/unlock-all toggle |
| 4 | Simulator theming | CSS variables on container; classes map to variables; no JS color resolution |
| 5 | Simulator scripts | Declarative event arrays (not generators) |
| 6 | Loop behavior | On/off only; off = freeze on last frame with blinking cursor |
| 7 | Community themes | Separate "Community" tab on palette strip |
| 8 | Community cache | localStorage with 1-hour TTL |
| 9 | Color copy | Click swatch → copy hex → "Copied!" tooltip |
| 10 | Right panel core colors | 4 in a row (larger swatches), detail in hover tooltips |
| 11 | Custom builder controls | 4 sliders: Hue (rainbow track), Warmth, Saturation, Contrast (no color picker) |
| 12 | Comparison mode | Before/after clip-path slider, shared scenario engine |
| 13 | Additional themes | Tidal Pool, Merlot, Moss Garden, Nebula, Slate Peak, Seville, Moonstone |
| 14 | Ambient background | `body::before` pseudo-element radial gradient |
| 15 | URL sharing | Version prefix + `-` separator + lz-string compression |
| 16 | Export architecture | Separate serializer (pure) + exporter (side effects) |
| 17 | Speed range | 0–3x in 0.1x increments |
| 18 | Store | Zustand vanilla, one central store, localStorage sync for preferences |

---

## File & Folder Structure

```
afterglow/
├── index.html
├── package.json
├── tsconfig.json
├── STATUS.md
├── agent/                         # Agent instruction files (this folder)
│   ├── PLAN.md                    # This file (master plan)
│   ├── phase-1.md through phase-8.md
├── themes/                        # Theme JSON files (served by jsDelivr in prod)
│   ├── registry.json
│   └── *.json                     # 16 theme files
├── src/
│   ├── main.ts                    # App entry
│   ├── style.css                  # Global styles + CSS variable framework
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── theme.ts               # All type definitions
│   ├── store/
│   │   └── store.ts               # Zustand vanilla store
│   ├── themes/
│   │   ├── bundled.ts             # Static imports of bundled themes
│   │   └── registry.ts            # Community theme fetching + caching
│   ├── color/
│   │   ├── oklch.ts               # OKLCH ↔ sRGB ↔ hex conversions
│   │   ├── generator.ts           # Palette generation algorithm
│   │   ├── contrast.ts            # WCAG contrast ratio
│   │   └── derive.ts              # Bright derivation, lock propagation
│   ├── simulator/
│   │   ├── engine.ts              # Playback engine
│   │   ├── renderer.ts            # DOM renderer
│   │   └── scenarios/
│   │       ├── index.ts           # Scenario registry
│   │       └── *.ts               # Individual scenarios
│   ├── export/
│   │   ├── plist.ts               # Binary plist encoder
│   │   ├── exporter.ts            # Blob + download trigger
│   │   └── serializers/
│   │       ├── terminal.ts        # macOS .terminal XML
│   │       ├── json.ts            # Raw JSON
│   │       └── css.ts             # CSS variables
│   ├── ui/
│   │   ├── header.ts
│   │   ├── palette-strip.ts
│   │   ├── preview.ts
│   │   ├── comparison.ts
│   │   ├── right-panel.ts
│   │   ├── color-display.ts
│   │   ├── custom-builder.ts
│   │   ├── modal.ts
│   │   ├── search.ts
│   │   └── font-controls.ts
│   ├── sharing/
│   │   └── url.ts
│   └── utils/
│       ├── dom.ts
│       ├── clipboard.ts
│       └── storage.ts
```

---

## TypeScript Types

```typescript
// src/types/theme.ts

export interface ThemeColors {
  background: string;
  text: string;
  bold: string;
  selection: string;
  cursor: string;
  cursorText: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export interface Theme {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  colors: ThemeColors;
  source: 'bundled' | 'community' | 'custom';
}

export type ColorSlotId = keyof ThemeColors;
export type CoreColorSlot = 'background' | 'text' | 'bold' | 'selection';
export type AnsiNormalSlot = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';
export type AnsiBrightSlot = 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow' | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite';

export const NORMAL_TO_BRIGHT: Record<AnsiNormalSlot, AnsiBrightSlot> = {
  black: 'brightBlack', red: 'brightRed', green: 'brightGreen', yellow: 'brightYellow',
  blue: 'brightBlue', magenta: 'brightMagenta', cyan: 'brightCyan', white: 'brightWhite',
};
```

---

## Zustand Store Shape

```typescript
export interface CustomControls {
  hue: number;         // 0–360
  warmth: number;      // -1 to 1
  saturation: number;  // 0 to 1
  contrast: number;    // 0 to 1
}

export type ScenarioId = 'all' | 'git' | 'python' | 'logs' | 'system' | 'docker' | 'files' | 'build' | 'ssh';

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
  speed: number;              // 0–3
  looping: boolean;
  comparisonEnabled: boolean;
  comparisonThemeId: string | null;
  sliderPosition: number;    // 0–100
  favorites: Set<string>;
  fontSize: number;           // 12–16
  fontFamily: string;
  registryStatus: 'idle' | 'loading' | 'loaded' | 'error';
  communityThemeIds: string[];
  activeTab: 'handcrafted' | 'community';
  searchQuery: string;
}
```

---

## Color Generation Algorithm (OKLCH)

```
generatePalette(hue, warmth, saturation, contrast) → ThemeColors

1. effectiveHue = hue + (warmth * 30)

2. background: L=lerp(0.10,0.18, contrast*0.3), C=0.01+sat*0.02, H=effectiveHue
3. text:       L=lerp(0.80,0.92, contrast),     C=0.005+sat*0.01, H=effectiveHue
4. bold:       L=text.L+0.05, C=text.C+0.005
5. selection:  L=bg.L+0.08, C=bg.C+0.02
6. cursor = text, cursorText = background

7. ANSI normals — fixed semantic hues shifted by warmth:
   red→25°, green→145°, yellow→85°, blue→260°, magenta→320°, cyan→185°
   Each: H=semanticHue+(warmth*15), L=lerp(0.55,0.70, contrast*0.5), C=lerp(0.06,0.14, sat)
   black: L=lerp(0.25,0.35,contrast), C=0.01
   white: L=lerp(0.70,0.80,contrast), C=0.01

8. ANSI brights — derived from normals:
   L=normal.L+lerp(0.08,0.15,contrast), C=normal.C+0.02, H=normal.H

9. Convert all OKLCH→hex, clamp out-of-gamut.
```

---

## Simulator Architecture

- **Scenarios**: Declarative arrays of `ScenarioEvent` objects
- **Engine**: `setTimeout` chains, speed-scaled delays, loop/pause support
- **Renderer**: Writes `<span class="ansi-red">` etc., CSS variables handle actual colors
- **Speed changes**: Cancel timeout, recalculate remaining delay at new speed

---

## Export Architecture

- **Serializers** (pure functions): `serializeTerminal()`, `serializeJson()`, `serializeCssVars()`
- **Exporter**: Takes serialized output → Blob → `<a download>` trigger
- **Plist encoder**: Rewrite of `color-theme-min.js` in TypeScript
- **Post-export**: Modal with Terminal.app import steps (first export per session only)

---

## Comparison Mode

- Two full-size preview divs stacked absolutely
- Top layer clipped: `clip-path: inset(0 0 0 ${sliderX}px)`
- Draggable vertical bar at clip boundary
- Both share same simulator data, different CSS variables

---

## URL Sharing

Format: `?theme=01-<lz-string-compressed>`
- Version prefix `01` + separator `-` + compressed payload
- Payload: theme name + null byte + concatenated hex values (fixed slot order)
- Backward compatible: future versions add new parsers, old URLs always work
