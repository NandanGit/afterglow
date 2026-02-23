import type { Theme } from '../../types/theme.ts';

export function serializeJson(theme: Theme): string {
  const { source: _, ...rest } = theme;
  return JSON.stringify(rest, null, 2);
}
