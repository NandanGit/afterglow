# Key Design Decisions

These decisions are non-negotiable and affect how you should implement changes.

## 1. OKLCH Color Model

All color math uses OKLCH internally. Hex (`#RRGGBB`) is only for export, storage, and display. When generating or manipulating colors, work in OKLCH space, then convert to hex with gamut clamping.

## 2. Simulator Theming via CSS Variables

The simulator renderer uses CSS classes (`ansi-red`, `ansi-bright-green`, etc.) that map to `--theme-*` CSS variables. **No JS color resolution** — the simulator never reads color values directly. Change the CSS variables and the preview updates automatically.

## 3. No Frameworks, No UI Libraries

Pure TypeScript + DOM APIs. Components are plain functions that create/update DOM elements. No virtual DOM, no JSX, no component lifecycle. State reactivity comes from Zustand subscriptions.

## 4. Zustand Vanilla Store

Single store created with `createStore` from `zustand/vanilla`. No React bindings. Access via `store.getState()`, `store.setState()`, `store.subscribe()`. All shared state goes through this store.

## 5. Serializer/Exporter Split

Serializers are **pure functions** (theme → string). The exporter handles **side effects** (blob creation, download triggering, clipboard, modals). Keep this separation when adding new export formats.

## 6. Bundled vs Community Themes

Bundled themes are statically imported (zero network cost). Community themes load on-demand from jsDelivr CDN. Never bundle community themes — they must stay lazy-loaded.

## 7. Pin & Lock System

- **Pin**: Excludes a color slot from palette regeneration (manual edits auto-pin)
- **Lock**: Links a normal ANSI slot to its bright counterpart (bright auto-derives from normal)
- These are independent — a slot can be both pinned and locked

## 8. URL Sharing Format

Versioned format: `?theme=03-<lz-string-compressed>`. Payload = `name\0hexValues[\x01controls]`. Always backward-compatible — old version decoders are kept forever, new versions only add parsers.
