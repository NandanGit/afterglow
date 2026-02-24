# Types

> Source: `src/types/theme.ts` (50 lines)

## Core Types

- **`ThemeColors`** — 22 hex color fields: 6 core (`background`, `text`, `bold`, `selection`, `cursor`, `cursorText`) + 8 ANSI normals + 8 ANSI brights
- **`Theme`** — `{ id, name, subtitle, emoji, colors: ThemeColors, source: 'bundled' | 'community' | 'custom' }`
- **`ColorSlotId`** — `keyof ThemeColors` (union of all 22 slot names)
- **`CoreColorSlot`** — `'background' | 'text' | 'bold' | 'selection'`
- **`AnsiNormalSlot`** — `'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'`
- **`AnsiBrightSlot`** — `'brightBlack' | 'brightRed' | ... | 'brightWhite'`
- **`NORMAL_TO_BRIGHT`** — `Record<AnsiNormalSlot, AnsiBrightSlot>` mapping (e.g. `red → brightRed`)

## Store Types (from `src/store/store.ts`)

- **`CustomControls`** — `{ hue: number, warmth: number, saturation: number, contrast: number, brightness: number }`
- **`ScenarioId`** — `'all' | 'git' | 'python' | 'logs' | 'system' | 'docker' | 'files' | 'build' | 'ssh'`
- **`AppState`** — Full store shape (see `store.md`)

## Simulator Types (from `src/simulator/scenarios/index.ts`)

- **`Scenario`** — `{ id, title, prompt, windowTitle, commands: ScenarioCommand[] }`
- **`ScenarioCommand`** — `{ text, typeSpeed?, events: ScenarioEvent[] }`
- **`ScenarioEvent`** — `{ type: 'output' | 'clear' | 'pause', text?, tokens?: OutputToken[], delay }`
- **`OutputToken`** — `{ text, class? }`

## Color Types (from `src/color/oklch.ts`)

- **`Oklch`** — `{ L: number, C: number, H: number }`
