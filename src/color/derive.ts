import type { AnsiNormalSlot } from '../types/theme.ts';
import { hexToOklch, oklchToHex } from './oklch.ts';

export function deriveBright(normalHex: string): string {
  const oklch = hexToOklch(normalHex);
  return oklchToHex({
    L: oklch.L + 0.15,
    C: oklch.C + 0.02,
    H: oklch.H,
  });
}

export function propagateLockedPair(
  normalSlot: AnsiNormalSlot,
  normalHex: string,
  locks: Record<AnsiNormalSlot, boolean>,
): string | null {
  if (!locks[normalSlot]) return null;
  return deriveBright(normalHex);
}
