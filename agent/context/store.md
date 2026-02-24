# Store — State Management

> Source: `src/store/store.ts` (266 lines)

## AppState

| Field                | Type                              | Notes                           |
|----------------------|-----------------------------------|---------------------------------|
| `activeThemeId`      | `string`                          | ID of selected bundled theme    |
| `themes`             | `Map<string, Theme>`              | All loaded themes               |
| `customTheme`        | `Theme \| null`                   | Active custom palette           |
| `customControls`     | `CustomControls`                  | Slider values for custom builder|
| `pinnedColors`       | `Set<ColorSlotId>`                | Slots excluded from regeneration|
| `locks`              | `Record<AnsiNormalSlot, boolean>` | Normal→bright link per slot     |
| `globalLock`         | `boolean`                         | All locks on/off                |
| `customModeActive`   | `boolean`                         | Custom builder active           |
| `activeScenario`     | `ScenarioId`                      | Current simulator scenario      |
| `speed`              | `number`                          | 0–3, 0 = paused                |
| `looping`            | `boolean`                         | Simulator loops                 |
| `comparisonEnabled`  | `boolean`                         | Split comparison mode           |
| `comparisonThemeId`  | `string \| null`                  | Second theme for comparison     |
| `sliderPosition`     | `number`                          | 0–100 comparison slider         |
| `favorites`          | `Set<string>`                     | Favorited theme IDs             |
| `fontSize`           | `number`                          | 12–16                           |
| `fontFamily`         | `string`                          | Terminal font                   |
| `registryStatus`     | `'idle' \| 'loading' \| 'loaded' \| 'error'` | Community registry fetch state |
| `communityThemeIds`  | `string[]`                        | IDs from registry               |
| `activeTab`          | `'handcrafted' \| 'community'`   | Palette strip tab               |
| `searchQuery`        | `string`                          | Theme search filter             |

## CustomControls

```
hue: 0–360, warmth: -1 to 1, saturation: 0–1, contrast: 0–1, brightness: 0–1
```

## Actions (exported functions)

| Function                          | What it does                                      |
|-----------------------------------|---------------------------------------------------|
| `enterCustomMode()`               | Copies active theme → custom, all locks on        |
| `exitCustomMode()`                | Clears custom theme                               |
| `setCustomControl(key, value)`    | Update one slider, triggers `regeneratePalette`   |
| `setCustomControls(controls)`     | Batch update + clear pins + regenerate            |
| `regeneratePalette(overrides?)`   | Generate colors, respect pins & locks             |
| `editColor(slot, hex)`            | Manual color edit, auto-pins slot                 |
| `togglePin(slot)`                 | Pin/unpin from regeneration                       |
| `toggleLock(slot)`                | Link bright↔normal for one slot                   |
| `toggleGlobalLock()`              | Toggle all locks at once                          |
| `setCustomThemeName(name)`        | Update custom theme display name                  |

## localStorage Sync

Persisted automatically via `store.subscribe`:
- `afterglow-favorites` → serialized Set
- `afterglow-fontSize` → number string
- `afterglow-fontFamily` → string

## Patterns

- **Read state**: `store.getState()`
- **Update state**: `store.setState({ ... })` (shallow merge)
- **Subscribe**: `store.subscribe((state, prev) => { ... })` — fires on every change, compare fields to react selectively
- Store is `zustand/vanilla` — no React hooks, just plain JS
