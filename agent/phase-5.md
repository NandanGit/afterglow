# Phase 5: Custom Theme Builder

> **Prerequisites**: Phase 4 (Terminal Simulator) must be complete
> **Read first**: `agent/PLAN.md` for full project context, especially the Color Generation Algorithm section
> **After completing**: Update `STATUS.md` Phase 5 to ✅

## Overview

Implement the custom theme builder: the OKLCH palette generation algorithm, bright-from-normal derivation, the custom builder UI with 4 sliders (Hue, Warmth, Saturation, Contrast), editable swatch grid with auto-pin and per-slot locks, and the "Surprise Me" random generator.

## Before You Start

1. Ensure `npm run dev` is running
2. Check `STATUS.md` confirms Phase 4 is ✅

## Tasks

### 5.1 Implement `src/color/generator.ts`

The core palette generation algorithm. All math in OKLCH space, output as hex.

```typescript
import type { ThemeColors } from '../types/theme';
import type { CustomControls } from '../store/store';

export function generatePalette(controls: CustomControls): ThemeColors;
```

**Algorithm** (from PLAN.md):

```
Inputs: hue (0–360), warmth (-1 to 1), saturation (0 to 1), contrast (0 to 1)

1. effectiveHue = hue + (warmth * 30)

2. background: L=lerp(0.10, 0.18, contrast*0.3), C=0.01+sat*0.02, H=effectiveHue
3. text:       L=lerp(0.80, 0.92, contrast),      C=0.005+sat*0.01, H=effectiveHue
4. bold:       L=text.L+0.05, C=text.C+0.005
5. selection:  L=bg.L+0.08, C=bg.C+0.02
6. cursor = text hex, cursorText = background hex

7. ANSI normals — semantic hue targets shifted by warmth:
   red→25°, green→145°, yellow→85°, blue→260°, magenta→320°, cyan→185°
   For each: H=semanticHue+(warmth*15), L=lerp(0.55,0.70,contrast*0.5), C=lerp(0.06,0.14,sat)
   black: L=lerp(0.25,0.35,contrast), C=0.01, H=effectiveHue
   white: L=lerp(0.70,0.80,contrast), C=0.01, H=effectiveHue

8. ANSI brights — derived from normals:
   L=normal.L+lerp(0.08,0.15,contrast), C=normal.C+0.02, H=normal.H

9. Convert all OKLCH→hex via oklchToHex() (which clamps out-of-gamut)
```

Use a `lerp(a, b, t)` helper: `a + (b - a) * t`.

### 5.2 Implement `src/color/derive.ts`

```typescript
import type { AnsiNormalSlot } from '../types/theme';

// Derive a bright color from a normal color (for locked pairs)
export function deriveBright(normalHex: string): string;
// Implementation: convert to OKLCH, L += 0.15, C += 0.02, clamp, convert back to hex

// Apply locked-pair propagation: when a normal color changes, update its bright if locked
export function propagateLockedPair(
  normalSlot: AnsiNormalSlot,
  normalHex: string,
  locks: Record<AnsiNormalSlot, boolean>
): string | null;
// Returns new bright hex if lock is engaged, null if unlocked
```

### 5.3 Update Store Actions

Add custom builder actions to `src/store/store.ts`:

```typescript
// Enter custom mode — initialize custom theme from current active theme
enterCustomMode(): void {
  const activeTheme = this.themes.get(this.activeThemeId);
  // Clone the theme as custom, set customModeActive = true
  // Approximate controls from the theme colors (or use defaults: hue=120, warmth=0, sat=0.5, contrast=0.5)
  // Clear pinned colors
  // Set all locks to true (default after generation)
}

exitCustomMode(): void {
  // Set customModeActive = false, clear customTheme
}

setCustomControl(key: keyof CustomControls, value: number): void {
  // Update the control value
  // Regenerate palette from controls, respecting pinned colors
  // If locks are engaged, propagate normal→bright changes
}

regeneratePalette(): void {
  // Generate full palette from current controls
  // For each color slot: if pinned, keep current value; otherwise use generated value
  // For each locked pair: derive bright from normal
}

editColor(slot: ColorSlotId, hex: string): void {
  // Update the specific color
  // Auto-pin this slot
  // If this is a normal slot and its lock is engaged, derive and update the bright
}

togglePin(slot: ColorSlotId): void {
  // Toggle pin state
  // If unpinning, immediately regenerate this slot from current controls
}

toggleLock(slot: AnsiNormalSlot): void {
  // Toggle lock for this specific pair
}

toggleGlobalLock(): void {
  // If any lock is off → turn all on
  // If all locks are on → turn all off
}
```

### 5.4 Implement `src/ui/custom-builder.ts`

**Default state** (not in custom mode):
```
┌─────────────────────────────────┐
│         CREATE CUSTOM THEME     │
│    [    Start Building    ]     │
└─────────────────────────────────┘
```

A styled CTA button. Clicking it calls `store.enterCustomMode()`.

**Active custom mode:**
```
┌─────────────────────────────────────────┐
│  CUSTOM BUILDER              [Discard]  │
│                                         │
│  Theme Name: [___editable input___]     │
│                                         │
│  Hue        🌈━━━━━●━━━━━━━━━━━━━      │
│  Warmth     ━━━━━━━●━━━━━━━━━━━━━      │
│  Saturation ━━━━━━━━━●━━━━━━━━━━━      │
│  Contrast   ━━━━━━━━━━━●━━━━━━━━━      │
│                                         │
│  [🎲 Surprise Me]                       │
│                                         │
│  Normal   ○ ○ ○ ○ ○ ○ ○ ○    🔒 All    │
│           🔗🔗🔗🔗🔗🔗🔗🔗              │
│  Bright   ○ ○ ○ ○ ○ ○ ○ ○              │
│                                         │
│  [📥 Export]  [📋 CSS Variables]        │
└─────────────────────────────────────────┘
```

**Slider styling:**
- Hue slider: track background is a CSS rainbow gradient (`linear-gradient(to right, oklch(0.7 0.15 0), oklch(0.7 0.15 60), ..., oklch(0.7 0.15 360))` or use a simpler HSL rainbow)
- Warmth/Saturation/Contrast sliders: dark track, themed thumb
- All sliders: `<input type="range">` with custom CSS styling
- Each slider fires `store.setCustomControl(key, value)` on `input` event

**Swatch grid:**
- Normal row: 8 circular swatches, each showing the current color
- Bright row: 8 circular swatches below
- Between each vertical pair: a small chain 🔗 icon (link/lock indicator)
  - Filled/highlighted when locked (editing normal propagates to bright)
  - Dimmed/outline when unlocked (bright is independent)
  - Click to toggle: `store.toggleLock(slot)`
- "🔒 All" button at the end of the row: `store.toggleGlobalLock()`
- Pinned swatches show a small 📌 indicator (overlaid on the swatch)
- Click swatch → open a color edit UI

**Color editing:**
- When a swatch is clicked, show a popover/inline color picker
- Could use `<input type="color">` styled to be small and dark, or a simple hex input field
- On change: `store.editColor(slot, hex)` — this auto-pins the color
- Click the pin icon to unpin (remove from pinnedColors, regenerate from controls)

**Surprise Me button:**
- Randomize: `hue = Math.random() * 360`, `warmth = Math.random() * 2 - 1`, `saturation = 0.3 + Math.random() * 0.5`, `contrast = 0.3 + Math.random() * 0.5`
- Call `store.setCustomControls(...)` which triggers regeneration
- Clear all pins (new random = fresh start)

**Discard button:**
- Calls `store.exitCustomMode()`

**Icon usage — use Lucide icons throughout (tree-shakeable, import individually):**
- Surprise Me: Lucide `Dices` icon
- Lock/Unlock: Lucide `Lock` / `Unlock` icons
- Pin/Unpin: Lucide `Pin` / `PinOff` icons
- Link (normal↔bright): Lucide `Link` / `Unlink` icons
- Discard: Lucide `X` icon

**Export split-button** (functionality in Phase 6 — for now, just show the button):
- Lucide `Download` icon + "Export" with Lucide `ChevronDown` dropdown arrow — disabled for now
- Dropdown formats: `.terminal`, `.json`, `.css`
- Lucide `ClipboardCopy` icon + "Copy CSS" — disabled for now

**Theme name:**
- Editable text input at the top
- Updates `store.customTheme.name`
- Default: "Custom Theme"

```typescript
export function mountCustomBuilder(container: HTMLElement): () => void;
```

### 5.5 Update `src/main.ts`

Mount the custom builder:
```typescript
import { mountCustomBuilder } from './ui/custom-builder';
mountCustomBuilder(document.getElementById('custom-builder')!);
```

### 5.6 Update Theme Application Logic

When `customModeActive` is true, the preview and color display should use `customTheme` colors instead of the active preset theme. Update the CSS variable application logic in `main.ts`:

```typescript
store.subscribe((state) => {
  const theme = state.customModeActive && state.customTheme
    ? state.customTheme
    : state.themes.get(state.activeThemeId);
  if (theme) applyThemeVars(theme);
});
```

## Verification

1. "Create Custom Theme" button appears in the custom builder area
2. Clicking it enters custom mode — sliders appear, swatches are generated
3. Moving sliders changes the palette in real-time — preview terminal re-colors instantly
4. Editing a swatch color auto-pins it (pin icon appears)
5. Moving sliders after pinning — pinned colors stay, others change
6. Lock icons between pairs work — locked: editing normal updates bright; unlocked: independent
7. "🔒 All" toggles all locks
8. Unpinning a color regenerates it from current slider values
9. "🎲 Surprise Me" randomizes sliders and generates a new palette
10. "Discard" returns to preset theme mode
11. `npm run build` succeeds

## Files Created/Modified

- **Created**: `src/color/generator.ts`, `src/color/derive.ts`, `src/ui/custom-builder.ts`
- **Modified**: `src/store/store.ts`, `src/main.ts`, `src/style.css`
