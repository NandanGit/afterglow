# Themes — Data & Registry

> Source: `themes/`, `src/themes/bundled.ts`, `src/themes/registry.ts`

## Theme JSON Structure

Each theme is a JSON file in `themes/bundled/` or `themes/community/`:

```json
{
  "id": "ember",
  "name": "Ember",
  "subtitle": "Near-black · amber and flame",
  "emoji": "🔥",
  "colors": {
    "background": "#1A1210", "text": "#D4C8BC", "bold": "#E8DCD0",
    "selection": "#2E2218", "cursor": "#D4C8BC", "cursorText": "#1A1210",
    "black": "#3A3230", "red": "#C87858", "green": "#88A860",
    "yellow": "#C8A850", "blue": "#6888A8", "magenta": "#A87880",
    "cyan": "#60A888", "white": "#C8C0B8",
    "brightBlack": "#5A5250", "brightRed": "#E29272", "brightGreen": "#A2C27A",
    "brightYellow": "#E2C26A", "brightBlue": "#82A2C2", "brightMagenta": "#C2929A",
    "brightCyan": "#7AC2A2", "brightWhite": "#E2DAD2"
  }
}
```

## 16 Bundled Themes

understory (default), void-orchid, ember, arctic, sakura-dusk, copper-mill, deep-ocean, noir, desert-night, tidal-pool, merlot, moss-garden, nebula, slate-peak, seville, moonstone

## Loading

- **Bundled**: Statically imported in `src/themes/bundled.ts` → `Map<string, Theme>` with `source: 'bundled'` added
- **Community**: Fetched on-demand via `fetchCommunityTheme(id)` from jsDelivr CDN

## Registry (`themes/registry.json`)

```typescript
interface Registry {
  version: number;
  bundledThemes: RegistryEntry[];   // metadata only (id, name, subtitle, emoji)
  communityThemes: RegistryEntry[];
}
```

- Fetched via `fetchRegistry()` from jsDelivr
- Cached in localStorage with 1-hour TTL (`afterglow-registry` key)

## CDN

```
Base: https://cdn.jsdelivr.net/gh/NandanGit/afterglow@main/themes/
Registry: .../themes/registry.json
Community: .../themes/community/{id}.json
```

jsDelivr auto-serves public GitHub repos. Push to `main` → available immediately (~12h cache propagation).
