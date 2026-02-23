# Phase 3: Core UI

> **Prerequisites**: Phase 2 (Theme Data) must be complete
> **Read first**: `agent/PLAN.md` for full project context
> **After completing**: Update `STATUS.md` Phase 3 to ✅

## Overview

Build the main UI components: the header, the horizontally scrollable palette strip with theme cards, and the right-panel color display (core colors + ANSI swatches with click-to-copy).

## Before You Start

1. Ensure `npm run dev` is running
2. Open `theme-builder-mockup.jpeg` for visual reference — match the mockup's styling closely
3. Check `STATUS.md` confirms Phase 2 is ✅

## Tasks

### 3.1 Implement `src/ui/header.ts`

Mount function that creates the header:

```
Terminal Theme Builder · {ActiveThemeName}
16 HANDCRAFTED THEMES · LIVE PREVIEW · CUSTOM BUILDER
```

- Title should update dynamically when the active theme changes (subscribe to store)
- Title font: large, slightly italic or light weight
- Subtitle: small caps, muted color, letter-spaced
- Match the mockup's header styling

```typescript
export function mountHeader(container: HTMLElement): () => void;
```

### 3.2 Implement `src/ui/palette-strip.ts`

The palette strip is the horizontally scrollable row of theme cards.

**Structure:**
- "CHOOSE A PALETTE" label above
- Tab bar: "Handcrafted" / "Community" tabs (Community tab is non-functional for now — just the tab UI)
- Horizontally scrollable container of theme cards
- Each card shows:
  - A row of small colored dots (the theme's ANSI colors as a mini palette preview)
  - Theme emoji + name
  - Theme subtitle (truncated with ellipsis if too long)
  - A star/favorite icon (top-right corner, toggleable)
- Active theme card has a highlighted border (dashed or solid, matching mockup)
- Clicking a card updates `store.activeThemeId`

**Scrolling:**
- CSS `overflow-x: auto` with `scroll-snap-type: x mandatory` on the container
- Each card: `scroll-snap-align: start`
- Hide scrollbar with `-webkit-scrollbar` styles or `scrollbar-width: none`

**Card dimensions:** Each card should be wide enough to comfortably fit its content (~180–200px min-width). Title and subtitle must be truncated with ellipsis (`text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`) if they overflow. Height ~100px (refer to mockup proportions).

**Favorites:** Use Lucide `Star` icon in top-right (import from `lucide`). Filled/solid when favorited, outline/stroke when not. Toggle on click → `store.toggleFavorite(id)`.

```typescript
export function mountPaletteStrip(container: HTMLElement): () => void;
```

### 3.3 Implement `src/ui/color-display.ts`

The right-panel color display section.

**Structure:**
- "TERMINAL CORE" label
- 4 core color swatches in a single row (Background, Text, Bold, Selected) — each is a larger rectangle swatch. They should be about equal width, filling the row.
- "NORMAL COLORS" label
- 8 round swatches in a row (black, red, green, yellow, blue, magenta, cyan, white)
- "BRIGHT COLORS" label
- 8 round swatches in a row (brightBlack through brightWhite)

**Interactions:**
- **Click any swatch**: Copy its hex value to clipboard, show a brief "Copied!" tooltip that fades after 1.5s
- **Hover any swatch**: Show a tooltip with "ColorName · #HEXVAL" (e.g., "Cyan · #6AAF96"). For core colors, also show the WCAG contrast ratio against background (e.g., "Text · #D4CDBF · 9.2:1 AA")
- **Cursor**: Changes to pointer on hover, swatch gets a subtle scale-up animation

**Swatches update when active theme changes** (subscribe to store).

**WCAG contrast**: For the tooltip, calculate the contrast ratio between the swatch color and the background color. Show the ratio and the level (AAA/AA/Fail). You'll need `src/color/contrast.ts` for this — implement it now:

```typescript
// src/color/contrast.ts
export function relativeLuminance(hex: string): number;
export function contrastRatio(hex1: string, hex2: string): number;
export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'Fail';
```

Standard WCAG 2.1 formula:
- Relative luminance: linearize each sRGB channel, then `0.2126*R + 0.7152*G + 0.0722*B`
- Contrast ratio: `(L1 + 0.05) / (L2 + 0.05)` where L1 is the lighter

**Clipboard**: Implement `src/utils/clipboard.ts`:
```typescript
export async function copyToClipboard(text: string): Promise<boolean>;
```

```typescript
export function mountColorDisplay(container: HTMLElement): () => void;
```

### 3.4 Update `src/main.ts`

Mount the new components:
```typescript
import { mountHeader } from './ui/header';
import { mountPaletteStrip } from './ui/palette-strip';
import { mountColorDisplay } from './ui/color-display';

// ... after creating layout structure
mountHeader(document.getElementById('header')!);
mountPaletteStrip(document.getElementById('palette')!);
mountColorDisplay(document.getElementById('color-display')!);
```

### 3.5 CSS Styling

Add styles to `src/style.css` (or create component-specific CSS if you prefer, imported in each module):

- Theme cards: dark surface color, rounded corners, subtle border, hover brightness increase
- Active card: dashed/highlighted border (match mockup — appears to be a dashed green/themed border)
- Color swatches (round): `border-radius: 50%`, ~32px diameter for ANSI, ~60px×40px for core
- Tooltips: positioned above/below the swatch, dark bg, small text, `pointer-events: none`, fade in/out animation
- Section labels: small caps, letter-spaced, muted color (match mockup typography)
- Star icon: Lucide `Star` SVG, absolute positioned in card top-right

## Verification

1. The palette strip shows all 16 theme cards in a scrollable row
2. Clicking a card changes the active theme — right panel swatches update, card border highlights
3. Hovering a swatch shows "ColorName · #hex" tooltip
4. Clicking a swatch copies the hex value (verify in DevTools console or paste somewhere)
5. "Copied!" feedback appears and disappears
6. Favorite star toggles on click
7. `npm run build` succeeds with no errors

## Files Created/Modified

- **Created**: `src/ui/header.ts`, `src/ui/palette-strip.ts`, `src/ui/color-display.ts`, `src/color/contrast.ts`, `src/utils/clipboard.ts`
- **Modified**: `src/main.ts`, `src/style.css`
