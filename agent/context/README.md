# Afterglow — LLM Context

> **Load this file at the start of every session.** It gives you the project overview and tells you which context files to read for your task.

## What Is This?

A browser-based **Terminal Theme Builder** — browse 16 handcrafted themes, preview with animated terminal simulations, build custom themes from a single hue, export to macOS `.terminal` / JSON / CSS.

## Tech Stack & Constraints

- **Vite + TypeScript** (`strict: true`, no `any`)
- **No frameworks** (no React/Vue), **no UI libraries** (no Tailwind/Material)
- **State**: `zustand/vanilla` — one central store, localStorage for preferences
- **Icons**: Lucide (tree-shakeable SVGs)
- **Font**: JetBrains Mono (Google Fonts)
- **Target**: Desktop ≥ 1280px, no mobile
- **Color model**: OKLCH internally, hex for export/storage/display

## File Tree

```
src/
├── main.ts                  # App entry — mounts all UI, applies theme CSS vars, keyboard shortcuts
├── style.css                # Global styles + CSS variable framework
├── types/theme.ts           # Theme, ThemeColors, ColorSlotId, slot type unions
├── store/store.ts           # Zustand store — AppState, all actions, localStorage sync
├── color/
│   ├── oklch.ts             # OKLCH ↔ sRGB ↔ hex conversions
│   ├── generator.ts         # generatePalette(controls) → ThemeColors
│   ├── derive.ts            # Bright color derivation from normals
│   └── contrast.ts          # WCAG contrast ratio utilities
├── simulator/
│   ├── engine.ts            # Playback engine — setTimeout chains, speed scaling
│   ├── renderer.ts          # DOM renderer — ANSI spans + CSS variables
│   └── scenarios/*.ts       # 9 declarative scenario definitions
├── export/
│   ├── exporter.ts          # Blob creation + download trigger
│   ├── plist.ts             # macOS binary plist encoder
│   └── serializers/*.ts     # terminal.ts, json.ts, css.ts (pure functions)
├── ui/
│   ├── header.ts            # App header
│   ├── palette-strip.ts     # Theme selector cards
│   ├── preview.ts           # Terminal preview panel
│   ├── color-display.ts     # Color grid with contrast, locking, pinning
│   ├── custom-builder.ts    # Hue/warmth/saturation/contrast sliders
│   ├── comparison.ts        # Before/after clip-path slider
│   ├── search.ts            # Theme search bar
│   ├── font-controls.ts     # Font family/size controls
│   └── modal.ts             # Modal dialogs
├── sharing/url.ts           # URL encode/decode for theme sharing (lz-string)
├── themes/
│   ├── bundled.ts           # Static imports of 16 bundled themes
│   └── registry.ts          # Community theme fetching + caching (jsDelivr)
└── utils/
    ├── dom.ts               # createElement, $, $$
    ├── clipboard.ts         # copyToClipboard
    └── storage.ts           # localStorage with TTL
```

## Context File Routing

| If your task involves…              | Read this file     |
|-------------------------------------|--------------------|
| Store, state, actions               | `store.md`         |
| UI components, DOM, CSS vars        | `ui.md`            |
| Color math, palette generation      | `color.md`         |
| Terminal simulator, scenarios       | `simulator.md`     |
| Export formats, plist, download     | `export.md`        |
| Types, interfaces                   | `types.md`         |
| Theme data, registry, CDN          | `themes.md`        |
| Architecture / design decisions     | `decisions.md`     |

> **Read the relevant file(s) above, then read the actual source files you need.** These context files give you the map; the source is the territory.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # tsc + vite build
npm run preview  # Preview production build
```

## ⚠️ Maintenance Rule

**When you make important changes** — new modules, changed interfaces, new patterns, architectural shifts — **update the relevant context files in `agent/context/`** so they stay accurate for future sessions. If needed, even add new context files.
