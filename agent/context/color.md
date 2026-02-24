# Color System

> Source: `src/color/oklch.ts`, `generator.ts`, `derive.ts`, `contrast.ts`

## Pipeline

```
OKLCH (internal) ↔ OKLab ↔ Linear sRGB ↔ sRGB (gamma) ↔ Hex (#RRGGBB)
```

## Key Functions

| Function                  | File          | Purpose                                  |
|---------------------------|---------------|------------------------------------------|
| `hexToOklch(hex)`         | `oklch.ts`    | Hex → `{ L, C, H }` (Oklch)             |
| `oklchToHex(oklch)`       | `oklch.ts`    | Oklch → hex, with gamut clamping         |
| `clampToGamut(oklch)`     | `oklch.ts`    | Binary search on chroma to fit sRGB      |
| `generatePalette(controls)` | `generator.ts` | Controls → full ThemeColors (22 slots) |
| `deriveBright(normalHex)` | `derive.ts`   | Normal color → brighter variant          |
| `contrastRatio(hex1, hex2)` | `contrast.ts` | WCAG contrast ratio                    |
| `wcagLevel(ratio)`        | `contrast.ts` | Returns 'AAA', 'AA', or 'Fail'          |

## OKLCH Coordinate Space

- **L** (Lightness): 0–1
- **C** (Chroma): 0–~0.37 (higher = more saturated)
- **H** (Hue): 0–360°

## Palette Generation Algorithm

`generatePalette({ hue, warmth, saturation, contrast, brightness })`:

1. `effectiveHue = hue + warmth * 30`
2. **Background**: L driven by brightness (0→dark, 1→light), low chroma
3. **Text**: High L for dark themes, low L for light themes
4. **Bold**: Text ± 0.05 L
5. **Selection**: Background ± offset
6. **Cursor** = text color, **cursorText** = background color
7. **ANSI normals**: Fixed semantic hues (red=25°, green=145°, yellow=85°, blue=260°, magenta=320°, cyan=185°) shifted by warmth×15
8. **ANSI brights**: Normal + L offset + chroma boost
9. **Black/White**: Neutral (low chroma), L driven by contrast
10. All converted to hex via `oklchToHex` (gamut clamped)

## Pin & Lock Mechanics

- **Pinned** colors (`pinnedColors` Set): Excluded from regeneration — slider changes don't affect them
- **Locked** slots (`locks` Record): When a normal slot is locked, its bright counterpart auto-derives via `deriveBright()`
- **Auto-pin**: Manually editing a color (`editColor`) automatically pins it
- **Global lock**: Toggles all 8 normal↔bright locks at once
