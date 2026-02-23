# Phase 1: Foundation

> **Prerequisites**: None (this is the first phase)
> **Read first**: `agent/PLAN.md` for full project context and design decisions
> **After completing**: Update `STATUS.md` Phase 1 to ✅, then proceed to Phase 2

## Overview

Set up the project foundation: delete Vite boilerplate, install dependencies, implement core types, OKLCH color utilities, the Zustand store, base CSS, and DOM helpers.

## Before You Start

1. Run `npm run dev` to start the Vite dev server — keep it running throughout so the user can see changes live
2. Open the mockup image (`theme-builder-mockup.jpeg` in repo root) for visual reference

## Tasks

### 1.1 Delete Vite Boilerplate

Delete all default Vite content from `src/`:
- `src/counter.ts`
- `src/main.ts` (will be recreated)
- `src/style.css` (will be recreated)
- `src/typescript.svg`
- `public/vite.svg`

Keep only `src/vite-env.d.ts`.

### 1.2 Rewrite `index.html`

Replace the contents of `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Terminal Theme Builder</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 1.3 Install Dependencies

```bash
npm install zustand lz-string
npm install -D @types/lz-string
```

### 1.4 Implement `src/types/theme.ts`

Create the full type definitions as specified in `PLAN.md` → TypeScript Types section. This includes:
- `ThemeColors` interface (24 hex color fields)
- `Theme` interface (id, name, subtitle, emoji, colors, source)
- `ColorSlotId`, `CoreColorSlot`, `AnsiNormalSlot`, `AnsiBrightSlot` types
- `NORMAL_TO_BRIGHT` mapping constant

### 1.5 Implement `src/color/oklch.ts`

OKLCH ↔ sRGB ↔ hex conversion utilities. Key functions:

```typescript
export interface Oklch { L: number; C: number; H: number; }

export function hexToSrgb(hex: string): [number, number, number];
export function srgbToHex(r: number, g: number, b: number): string;
export function srgbToOklch(r: number, g: number, b: number): Oklch;
export function oklchToSrgb(oklch: Oklch): [number, number, number];
export function hexToOklch(hex: string): Oklch;
export function oklchToHex(oklch: Oklch): string;
export function clampToGamut(oklch: Oklch): Oklch;
```

The conversion pipeline:
- OKLCH → OKLab (polar → cartesian): `a = C * cos(H * π/180)`, `b = C * sin(H * π/180)`
- OKLab → linear sRGB (matrix multiply using standard coefficients)
- Linear sRGB → sRGB (gamma: `x <= 0.0031308 ? 12.92*x : 1.055*x^(1/2.4) - 0.055`)
- And the reverse for each step

For `clampToGamut`: Use a binary search on chroma — if the resulting sRGB values are outside [0,1], reduce chroma until they fit while preserving lightness and hue.

Use the CSS Color Level 4 spec reference matrices for OKLab↔linear sRGB conversion.

### 1.6 Implement `src/store/store.ts`

Create the Zustand vanilla store with the shape defined in `PLAN.md`. For now, implement:
- The full state interface
- Initial state values (defaults: `activeThemeId: 'understory'`, `speed: 1`, `looping: true`, `fontSize: 14`, `fontFamily: 'JetBrains Mono'`, etc.)
- Stub actions (they'll be fleshed out as features are built)
- localStorage hydration: on init, read `favorites`, `fontSize`, `fontFamily` from localStorage
- localStorage sync: subscribe to store changes, persist `favorites`, `fontSize`, `fontFamily`

```typescript
import { createStore } from 'zustand/vanilla';
```

### 1.7 Implement `src/style.css`

Base stylesheet with:
- CSS reset (box-sizing, margin/padding reset)
- Body: dark background (`#111`), font-family: JetBrains Mono, color: `#ccc`
- CSS variable framework for theme colors (all `--theme-*` variables)
- ANSI color classes: `.ansi-red { color: var(--theme-red); }` etc. for all 16 + bold + dim
- Ambient background pseudo-element (initially neutral):
  ```css
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -1;
    background: radial-gradient(ellipse at 20% 30%, var(--ambient-color, #111) 0%, #111 70%);
    transition: background 0.6s ease;
    pointer-events: none;
  }
  ```
- Basic layout grid: header at top, two-column layout (left: preview 65%, right: panel 35%)

### 1.8 Implement `src/utils/dom.ts`

DOM helper functions:
```typescript
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K, attrs?: Record<string, string>, children?: (Node | string)[]
): HTMLElementTagNameMap[K];

export function $(selector: string, parent?: Element): Element | null;
export function $$(selector: string, parent?: Element): Element[];
```

### 1.9 Implement `src/main.ts` (Stub)

Minimal entry point:
```typescript
import './style.css';
import { store } from './store/store';

const app = document.getElementById('app')!;
app.innerHTML = '<h1>Terminal Theme Builder</h1><p>Foundation ready.</p>';
```

This will be expanded in later phases to mount all UI components.

## Verification

After completing all tasks:
1. `npm run dev` should work with no errors
2. The page should show "Terminal Theme Builder" / "Foundation ready." on a dark background with JetBrains Mono font
3. `npm run build` should succeed with no TypeScript errors
4. The OKLCH utilities should be importable (test by adding a quick `console.log(oklchToHex({L:0.7, C:0.1, H:145}))` in main.ts — then remove it)

## Files Created/Modified

- **Deleted**: `src/counter.ts`, `src/typescript.svg`, `public/vite.svg`
- **Modified**: `index.html`
- **Created**: `src/types/theme.ts`, `src/color/oklch.ts`, `src/store/store.ts`, `src/style.css`, `src/utils/dom.ts`, `src/main.ts`
