# Phase 6: Export

> **Prerequisites**: Phase 5 (Custom Builder) must be complete
> **Read first**: `agent/PLAN.md`, and examine `color-theme-min.js` in the repo root for the existing plist/XML logic
> **After completing**: Update `STATUS.md` Phase 6 to ✅

## Overview

Rewrite the export system in TypeScript: binary plist encoder, macOS `.terminal` XML serializer, JSON serializer, CSS variables serializer, download trigger, and post-export info modal.

## Before You Start

1. Ensure `npm run dev` is running
2. Read `color-theme-min.js` in the repo root — this is the existing (working) logic to rewrite
3. Check `STATUS.md` confirms Phase 5 is ✅

## Tasks

### 6.1 Implement `src/export/plist.ts`

Rewrite the binary plist encoder from `color-theme-min.js` in clean TypeScript. The original has classes `_U` (UID), `_F` (Float), and function `_bplist()` that serializes to Apple's binary plist format.

```typescript
// Plist value types
export class PlistUID {
  constructor(public readonly value: number) {}
}

export class PlistFloat {
  constructor(public readonly value: number) {}
}

export type PlistValue =
  | null
  | boolean
  | number
  | string
  | Uint8Array
  | PlistUID
  | PlistFloat
  | PlistValue[]
  | { [key: string]: PlistValue };

export function encodeBinaryPlist(root: PlistValue): Uint8Array;
```

**Also rewrite the NSColor and NSFont encoders:**

```typescript
// Encode a hex color as NSKeyedArchiver NSColor binary plist
export function encodeNSColor(hex: string): Uint8Array;
// This creates the NSKeyedArchiver structure with NSRGB data

// Encode a font as NSKeyedArchiver NSFont binary plist
export function encodeNSFont(name: string, size: number): Uint8Array;
```

These correspond to `_color()` and `_font()` in the original script.

**Important**: Preserve the exact binary format — the output must be importable by Terminal.app. Test by comparing output against the original `_color()` for the same input hex.

### 6.2 Implement `src/export/serializers/terminal.ts`

Rewrite `generateTerminalFile()` from `color-theme-min.js` as a clean TypeScript serializer:

```typescript
import type { Theme } from '../../types/theme';

export interface TerminalExportOptions {
  fontName?: string;      // default: 'JetBrainsMono-Regular'
  fontSize?: number;      // default: 14
  columns?: number;       // default: 220
  rows?: number;          // default: 50
  cursorType?: number;    // 0=block, 1=underline, 2=bar
  cursorBlink?: boolean;  // default: true
}

export function serializeTerminal(theme: Theme, options?: TerminalExportOptions): string;
```

This generates a complete macOS `.terminal` plist XML file with:
- All `ThemeColors` fields mapped to the correct `ANSIXxxColor` keys
- `CursorColor` from `theme.colors.cursor`
- `CursorTextColor` from `theme.colors.cursorText` (new — not in original script)
- Font encoded as NSFont binary plist
- Window settings (columns, rows, cursor type, etc.)

The `_xml()` function from the original handles XML serialization of the plist dict — rewrite this too.

### 6.3 Implement `src/export/serializers/json.ts`

```typescript
import type { Theme } from '../../types/theme';

export function serializeJson(theme: Theme): string;
// Returns a pretty-printed JSON string of the theme object
// Omit the 'source' field from output
```

### 6.4 Implement `src/export/serializers/css.ts`

```typescript
import type { Theme } from '../../types/theme';

export function serializeCssVars(theme: Theme): string;
// Returns:
// :root {
//   --background: #1A1F18;
//   --text: #D4CDBF;
//   --bold: #EDE8DC;
//   ...
// }
```

Color slot names should be kebab-cased in the output (e.g., `brightRed` → `--bright-red`).

### 6.5 Implement `src/export/exporter.ts`

```typescript
import type { Theme } from '../types/theme';

export type ExportFormat = 'terminal' | 'json' | 'css';

export function exportTheme(theme: Theme, format: ExportFormat): void;
// 1. Call the appropriate serializer
// 2. Create a Blob with the correct MIME type
// 3. Create a temporary <a> element with download attribute
// 4. Trigger click → download
// 5. Clean up the object URL
// 6. Show export guide modal if first .terminal export this session

export function copyCssVars(theme: Theme): Promise<void>;
// 1. Call serializeCssVars
// 2. Copy to clipboard
// 3. Show brief "Copied!" feedback
```

**File naming**: `${slugify(theme.name)}.terminal` or `.json`
- Slugify: lowercase, replace spaces with hyphens, remove non-alphanumeric except hyphens

**MIME types**: `application/xml` for `.terminal`, `application/json` for `.json`

### 6.6 Implement `src/ui/modal.ts`

Generic modal component:

```typescript
export function showModal(options: {
  title: string;
  content: string | HTMLElement;
  closeLabel?: string;
}): void;

export function closeModal(): void;
```

**Modal styling:**
- Centered overlay with dark semi-transparent backdrop
- Rounded container, dark surface, light text
- Close button (×) in top-right
- Click backdrop to close
- Escape key to close

### 6.7 Export Guide Modal

After **every** export, show a modal with format-specific import instructions. The modal includes a checkbox: **"Don't show this again"**. If the user checks it and closes the modal, suppress future modals. Store this preference in `localStorage` (key: `exportGuideSuppress`).

**For `.terminal` exports:**
```
How to Import Your Theme

1. Open Terminal.app
2. Go to Terminal → Settings (⌘,)
3. Click the "Profiles" tab
4. Click the gear icon at the bottom
5. Select "Import..."
6. Choose your downloaded .terminal file
7. (Optional) Set as default profile

Note: Double-clicking the .terminal file will open a new
Terminal window with the theme, but won't save it permanently.

[ ] Don't show this again
```

**For `.json` exports:**
```
Your Theme JSON

Your theme has been exported as a JSON file.
You can use this file to share your theme or
import it into other tools that support JSON themes.

[ ] Don't show this again
```

Track suppression in `localStorage.setItem('exportGuideSuppress', 'true')`. Reset suppression if the user clears localStorage.

### 6.8 Wire Export Buttons in Custom Builder

Update `src/ui/custom-builder.ts` (use Lucide icons, not emojis):

**Export split-button with dropdown:**
- Primary button: Lucide `Download` icon + "Export" — clicking it exports in the last-used format (default: `.terminal`)
- Dropdown arrow at the end of the button (small chevron/caret) — opens a format picker:
  - `.terminal` (macOS Terminal.app)
  - `.json` (Raw JSON)
  - `.css` (CSS Variables) — this copies to clipboard instead of downloading
- Selecting a format from the dropdown exports immediately and sets it as the new default
- Lucide `ChevronDown` icon for the dropdown arrow
- Dropdown closes on selection or outside click

**CSS Variables button** (separate from export):
- Lucide `ClipboardCopy` icon + "Copy CSS" button → `copyCssVars(customTheme)`
- Both should also be accessible for preset themes (not just custom) — consider adding export buttons to the right panel or making them always visible

Also add export functionality for preset themes. Add export buttons to the color display section or right panel that work on the currently active theme (whether preset or custom).

## Verification

1. Export `.terminal` for a preset theme → file downloads with correct name
2. Import the `.terminal` file into Terminal.app → colors match the theme (if on macOS)
3. Export `.terminal` for a custom theme → works the same
4. Export guide modal appears on first export, not on subsequent exports in the same session
5. "📋 CSS Variables" copies a valid `:root { ... }` block to clipboard
6. Export JSON produces a clean, valid JSON file
7. Modal opens/closes correctly (×, backdrop click, Escape)
8. `npm run build` succeeds

## Files Created/Modified

- **Created**: `src/export/plist.ts`, `src/export/serializers/terminal.ts`, `src/export/serializers/json.ts`, `src/export/serializers/css.ts`, `src/export/exporter.ts`, `src/ui/modal.ts`
- **Modified**: `src/ui/custom-builder.ts`, `src/style.css`
