# UI — Components & DOM

> Source: `src/ui/*.ts`, `src/utils/dom.ts`, `src/main.ts`

## Mount Pattern

Every UI component exports a `mountX(container: HTMLElement)` function that:
1. Creates DOM elements and appends to `container`
2. Subscribes to the store for reactive updates
3. Returns a cleanup function (or void)

```typescript
// Example pattern
export function mountHeader(container: HTMLElement): void {
  // Build DOM, subscribe to store, attach listeners
}
```

Components are mounted once in `main.ts` — no re-mounting or virtual DOM.

## CSS Variable Flow

1. Theme selected → `applyThemeVars(theme)` in `main.ts`
2. Sets `--theme-background`, `--theme-red`, `--theme-bright-cyan`, etc. on `:root`
3. CSS and simulator renderer reference these variables
4. Ambient background: `--ambient-color` derived from theme background hue

```
theme.colors.brightGreen → --theme-bright-green (camelCase → kebab-case)
```

## Components

| File               | Lines | Purpose                                              |
|--------------------|-------|------------------------------------------------------|
| `header.ts`        | 23    | App title, theme name display                        |
| `palette-strip.ts` | 173   | Horizontal scrollable theme cards, tab switching     |
| `preview.ts`       | 177   | Terminal preview panel, hosts simulator               |
| `color-display.ts` | 364   | Color grid: swatches, contrast badges, pin/lock controls |
| `custom-builder.ts`| 230   | 5 sliders (hue, warmth, saturation, contrast, brightness) |
| `comparison.ts`    | 219   | Before/after split view with draggable clip-path slider |
| `search.ts`        | 39    | Search input filtering themes                        |
| `font-controls.ts` | 61    | Font family dropdown + size slider                   |
| `modal.ts`         | 49    | Generic modal: `showModal({ title, content, closeLabel })`, `closeModal()` |

## DOM Helpers (`src/utils/dom.ts`)

```typescript
createElement<K>(tag: K, attrs?: Record<string, string>, children?: (string | Node)[]): HTMLElement
$(selector: string, parent?: ParentNode): Element | null
$$(selector: string, parent?: ParentNode): Element[]
```

## Root Layout (`main.ts`)

```
#app
├── header.app-header
├── section.palette-section
│   └── div.palette-search-area
└── main.main-content
    ├── div.preview-panel
    └── div.right-panel
        ├── div.color-display
        ├── div.custom-builder
        └── div.font-controls-container
```

## Keyboard Shortcuts

| Key      | Action                          |
|----------|---------------------------------|
| ←/→      | Previous/Next theme             |
| Space    | Pause/Resume simulator          |
| E        | Export .terminal                 |
| C        | Copy CSS variables              |
| F        | Toggle favorite                 |
| /        | Focus search                    |
| ?        | Show shortcut cheatsheet        |
| Escape   | Close modal → exit comparison → exit custom |
