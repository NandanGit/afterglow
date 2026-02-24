# Export System

> Source: `src/export/exporter.ts`, `plist.ts`, `serializers/*.ts`

## Architecture

```
Theme → Serializer (pure) → string/bytes → Exporter (side effects) → download/clipboard
```

## Serializers (pure functions)

| Function                     | File              | Output              |
|------------------------------|-------------------|----------------------|
| `serializeTerminal(theme)`   | `serializers/terminal.ts` | macOS .terminal XML |
| `serializeJson(theme)`       | `serializers/json.ts`     | JSON string         |
| `serializeCssVars(theme)`    | `serializers/css.ts`      | CSS custom properties |

## Exporter (`exporter.ts`)

| Function                     | What it does                                    |
|------------------------------|-------------------------------------------------|
| `exportTheme(theme, format)` | Serializes + downloads. Format: `'terminal' \| 'json' \| 'css'` |
| `copyCssVars(theme)`         | Copies CSS vars to clipboard, shows brief modal |

- **Download**: Creates `Blob` → `URL.createObjectURL` → `<a download>` click → revoke
- **Post-export**: Shows import guide modal (suppressible via localStorage `exportGuideSuppress`)

## Plist Encoder (`plist.ts`)

Encodes macOS Terminal.app profile data as binary plist:

| Function               | Purpose                                  |
|-------------------------|------------------------------------------|
| `encodeBinaryPlist(root)` | JS object → binary plist buffer        |
| `encodeNSColor(hex)`   | Hex → NSKeyedArchiver color object       |
| `encodeNSFont(name, size)` | Font → NSKeyedArchiver font object   |

The terminal serializer uses these to embed colors in the `.terminal` XML format.

## Export Format: `ExportFormat = 'terminal' | 'json' | 'css'`
