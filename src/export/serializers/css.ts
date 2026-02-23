import type { Theme } from '../../types/theme.ts';

function toKebab(key: string): string {
  return key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

export function serializeCssVars(theme: Theme): string {
  const lines = [':root {'];
  for (const [key, value] of Object.entries(theme.colors)) {
    lines.push(`  --${toKebab(key)}: ${value};`);
  }
  lines.push('}');
  return lines.join('\n');
}
