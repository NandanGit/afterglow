# Phase 7: Additional Features

> **Prerequisites**: Phase 6 (Export) must be complete
> **Read first**: `agent/PLAN.md` for full project context
> **After completing**: Update `STATUS.md` Phase 7 to ✅

## Overview

Implement all remaining features: comparison mode, URL sharing, community theme registry, search/filter, font controls, keyboard shortcuts, ambient background, and favorites filter.

## Before You Start

1. Ensure `npm run dev` is running
2. Check `STATUS.md` confirms Phase 6 is ✅

## Tasks (can be done in any order within this phase)

### 7.1 Comparison Mode (`src/ui/comparison.ts`)

**Architecture:**
- When `store.comparisonEnabled` is true, the preview panel switches to comparison view
- Two full-size terminal preview containers, stacked with `position: absolute`
- Bottom layer: current active theme
- Top layer: comparison theme, clipped with `clip-path: inset(0 0 0 ${sliderX}px)`
- Draggable vertical bar at the clip boundary

**Implementation:**

```typescript
export function mountComparison(container: HTMLElement): () => void;
```

1. Create two preview containers (`.comparison-a` and `.comparison-b`)
2. Both use the same `TerminalRenderer` pattern — write identical content to both
3. The simulator engine emits events → both renderers receive them
4. Container A has CSS variables from the active theme; Container B from the comparison theme
5. Container B has `clip-path: inset(0 0 0 ${pos}px)` updated on slider drag
6. Draggable bar: `pointerdown` on bar → `pointermove` on document → `pointerup` cleanup
   - Clamp position to container bounds
   - Update `store.sliderPosition` (or keep position in local state since it's purely visual)

**Mini theme picker:**
- Small dropdown or compact theme selector above the comparison area
- Shows all available themes, allows selecting the second theme
- Updates `store.comparisonThemeId`

**Toggle:**
- The comparison toggle button in the preview panel (added in Phase 4) activates/deactivates this view
- When entering comparison mode, default the comparison theme to the next theme in the list
- When exiting, destroy the comparison view and return to single preview

### 7.2 URL Sharing (`src/sharing/url.ts`)

```typescript
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const CURRENT_VERSION = '01';
const SEPARATOR = '-';

const SLOT_ORDER_V1: ColorSlotId[] = [
  'background', 'text', 'bold', 'selection', 'cursor', 'cursorText',
  'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
];

export function encodeThemeToURL(theme: Theme): string;
// 1. Build payload: name + '\0' + concatenated hex (no # prefix)
// 2. Compress with compressToEncodedURIComponent
// 3. Return `${CURRENT_VERSION}${SEPARATOR}${compressed}`

export function decodeThemeFromURL(param: string): Theme | null;
// 1. Split on first SEPARATOR to get version and data
// 2. Switch on version, call version-specific decoder
// 3. Return null if invalid

function decodeV1(data: string): Theme | null;
// 1. Decompress with decompressFromEncodedURIComponent
// 2. Split on '\0' → name and hex string
// 3. Split hex string into 6-char chunks → map to SLOT_ORDER_V1
// 4. Build Theme object with source: 'custom'
```

**Integration with `main.ts`:**
- On app init, check for `?theme=` URL parameter
- If present, decode it → load as custom theme → enter custom mode
- Add a "Share" button in the custom builder that:
  1. Encodes the current custom theme
  2. Updates the URL with `history.replaceState`
  3. Copies the full URL to clipboard
  4. Shows "Link copied!" feedback

### 7.3 Community Theme Registry (`src/themes/registry.ts`)

```typescript
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/<user>/<repo>@main/themes';
// Replace <user>/<repo> with the actual GitHub repo path when known

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface RegistryCache {
  timestamp: number;
  data: RegistryEntry[];
}

export async function fetchRegistry(): Promise<RegistryEntry[]>;
// 1. Check localStorage for cached registry
// 2. If cache exists and is < 1hr old, return cached data
// 3. Otherwise fetch from jsDelivr, cache result, return
// 4. On fetch error, return cached data if available, otherwise throw

export async function fetchCommunityTheme(id: string): Promise<Theme>;
// 1. Check localStorage for cached theme JSON
// 2. If cached, return it
// 3. Otherwise fetch from jsDelivr, cache, return

export function clearRegistryCache(): void;
```

**Integration with store and palette strip:**
- When the "Community" tab is selected, call `store.fetchCommunityThemes()` (which calls `fetchRegistry()`)
- Display loading skeleton cards while fetching
- On success, show community theme cards (same card component as bundled themes, but maybe with a small community badge)
- On error, show error card with retry button
- Clicking a community theme card fetches its full JSON, adds to `store.themes`, sets as active

**Storage helpers** (`src/utils/storage.ts`):
```typescript
export function getWithTTL<T>(key: string): T | null;
// Returns null if expired or missing

export function setWithTTL<T>(key: string, value: T): void;
// Stores { timestamp: Date.now(), data: value }
```

### 7.4 Search/Filter (`src/ui/search.ts`)

```typescript
export function mountSearch(container: HTMLElement): () => void;
```

- Text input field above or integrated into the palette strip section
- On input, update `store.searchQuery`
- The palette strip filters visible cards: only show themes whose name or subtitle contains the query (case-insensitive)
- Clear button (×) inside the input to reset
- Styled to match the dark theme

### 7.5 Font Controls (`src/ui/font-controls.ts`)

```typescript
export function mountFontControls(container: HTMLElement): () => void;
```

- **Font size**: stepper (−/+) or dropdown, range 12–16px
- **Font family**: dropdown with options: JetBrains Mono, SF Mono, Menlo, Fira Code, Cascadia Code, Courier New
- Only affects the terminal preview (not the rest of the UI)
- Changes update `store.fontSize` / `store.fontFamily` → renderer applies them
- Persisted to localStorage (already set up in store)
- Place these controls near the speed control in the preview panel, or in a small settings area

### 7.6 Keyboard Shortcuts

Add a global `keydown` listener in `main.ts`:

| Key | Action | Notes |
|-----|--------|-------|
| ← | Previous theme | `store.setActiveTheme(previousId)` |
| → | Next theme | `store.setActiveTheme(nextId)` |
| Space | Pause/resume | Toggle speed between 0 and last non-zero speed |
| E | Export | `exportTheme(activeTheme, 'terminal')` |
| C | Copy CSS vars | `copyCssVars(activeTheme)` |
| ? | Shortcut cheatsheet | Open modal listing all shortcuts |
| / | Focus search | `searchInput.focus()` |
| F | Toggle favorite | `store.toggleFavorite(activeThemeId)` |
| Esc | Close/exit | Close modal, exit custom mode, exit comparison |

**Important**: Disable shortcuts when an input/textarea/select is focused (check `document.activeElement?.tagName`).

**Cheatsheet modal**: Use the `showModal()` from Phase 6 to display a formatted list of all shortcuts.

### 7.7 Ambient Background

In `main.ts` (or a dedicated module), update the ambient background when the active theme changes:

```typescript
import { hexToOklch, oklchToHex } from './color/oklch';

function updateAmbientBackground(theme: Theme): void {
  const oklch = hexToOklch(theme.colors.background);
  const ambientHex = oklchToHex({ L: 0.15, C: 0.02, H: oklch.H });
  document.documentElement.style.setProperty('--ambient-color', ambientHex);
}

// Subscribe to active theme changes
store.subscribe((state) => {
  const theme = state.customModeActive && state.customTheme
    ? state.customTheme
    : state.themes.get(state.activeThemeId);
  if (theme) updateAmbientBackground(theme);
});
```

The CSS for `body::before` was already set up in Phase 1. This just connects it to the store.

### 7.8 Favorites Enhancement

The star/favorite toggle was added in Phase 3. Now add:

- A "★ Favorites" filter chip/button near the search input
- When active, only shows favorited themes in the palette strip
- Toggle off to show all themes again
- If no favorites exist, show a friendly empty state: "No favorites yet — click ★ on any theme"

## Verification

1. **Comparison**: Toggle comparison mode → two themes visible side by side with draggable bar. Sliding the bar reveals different themes. Both show the same scenario content.
2. **URL sharing**: Enter custom mode, build a theme, click Share → URL updates, copy works. Open the URL in a new tab → same custom theme loads.
3. **Community themes**: Click Community tab → loading state → themes appear (or mock it if the GitHub repo isn't set up yet — use a placeholder URL and graceful error handling)
4. **Search**: Type in search → cards filter in real time. Clear → all cards show.
5. **Font controls**: Change font size → preview text resizes. Change font family → preview font changes. Persists across page reload.
6. **Keyboard shortcuts**: ←/→ cycles themes, Space pauses, ? shows cheatsheet, / focuses search.
7. **Ambient background**: Switch between themes → subtle page background hue shift visible.
8. **Favorites filter**: Star themes, toggle filter → only starred themes shown.
9. `npm run build` succeeds.

## Files Created/Modified

- **Created**: `src/ui/comparison.ts`, `src/sharing/url.ts`, `src/themes/registry.ts`, `src/ui/search.ts`, `src/ui/font-controls.ts`, `src/utils/storage.ts`
- **Modified**: `src/main.ts`, `src/ui/preview.ts`, `src/ui/palette-strip.ts`, `src/ui/custom-builder.ts`, `src/store/store.ts`, `src/style.css`
