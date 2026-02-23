import type { ThemeColors } from '../types/theme.ts';
import type { CustomControls } from '../store/store.ts';
import { oklchToHex } from './oklch.ts';
import type { Oklch } from './oklch.ts';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const SEMANTIC_HUES: Record<string, number> = {
  red: 25,
  green: 145,
  yellow: 85,
  blue: 260,
  magenta: 320,
  cyan: 185,
};

export function generatePalette(controls: CustomControls): ThemeColors {
  const { hue, warmth, saturation: sat, contrast } = controls;
  const effectiveHue = hue + warmth * 30;

  // Core colors
  const bgOklch: Oklch = { L: lerp(0.13, 0.22, contrast * 0.4), C: 0.01 + sat * 0.03, H: effectiveHue };
  const textOklch: Oklch = { L: lerp(0.80, 0.92, contrast), C: 0.005 + sat * 0.01, H: effectiveHue };
  const boldOklch: Oklch = { L: textOklch.L + 0.05, C: textOklch.C + 0.005, H: effectiveHue };
  const selectionOklch: Oklch = { L: bgOklch.L + 0.08, C: bgOklch.C + 0.02, H: effectiveHue };

  const background = oklchToHex(bgOklch);
  const text = oklchToHex(textOklch);
  const bold = oklchToHex(boldOklch);
  const selection = oklchToHex(selectionOklch);
  const cursor = text;
  const cursorText = background;

  // ANSI normals
  const ansiL = lerp(0.55, 0.70, contrast * 0.5);
  const ansiC = lerp(0.06, 0.14, sat);

  const normalColors: Record<string, Oklch> = {};
  for (const [name, semanticHue] of Object.entries(SEMANTIC_HUES)) {
    normalColors[name] = { L: ansiL, C: ansiC, H: semanticHue + warmth * 15 };
  }
  normalColors['black'] = { L: lerp(0.25, 0.35, contrast), C: 0.01, H: effectiveHue };
  normalColors['white'] = { L: lerp(0.70, 0.80, contrast), C: 0.01, H: effectiveHue };

  // ANSI brights — derived from normals
  const brightColors: Record<string, string> = {};
  for (const [name, oklch] of Object.entries(normalColors)) {
    const brightName = 'bright' + name.charAt(0).toUpperCase() + name.slice(1);
    brightColors[brightName] = oklchToHex({
      L: oklch.L + lerp(0.08, 0.15, contrast),
      C: oklch.C + 0.02,
      H: oklch.H,
    });
  }

  // Convert normals to hex
  const normalHex: Record<string, string> = {};
  for (const [name, oklch] of Object.entries(normalColors)) {
    normalHex[name] = oklchToHex(oklch);
  }

  return {
    background,
    text,
    bold,
    selection,
    cursor,
    cursorText,
    black: normalHex['black'],
    red: normalHex['red'],
    green: normalHex['green'],
    yellow: normalHex['yellow'],
    blue: normalHex['blue'],
    magenta: normalHex['magenta'],
    cyan: normalHex['cyan'],
    white: normalHex['white'],
    brightBlack: brightColors['brightBlack'],
    brightRed: brightColors['brightRed'],
    brightGreen: brightColors['brightGreen'],
    brightYellow: brightColors['brightYellow'],
    brightBlue: brightColors['brightBlue'],
    brightMagenta: brightColors['brightMagenta'],
    brightCyan: brightColors['brightCyan'],
    brightWhite: brightColors['brightWhite'],
  };
}
