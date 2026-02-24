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
  const { hue, warmth, saturation: sat, contrast, brightness: bright } = controls;
  const effectiveHue = hue + warmth * 30;

  // Brightness (0=dark, 1=light) drives the overall bg/text lightness.
  // Below 0.5 = dark mode (light text on dark bg), above 0.5 = light mode (dark text on light bg).
  const isDark = bright <= 0.5;

  // Background lightness: full range from very dark to very light
  const bgBaseL = lerp(0.10, 0.95, bright);
  const bgContrastShift = contrast * 0.06 * (isDark ? 1 : -1);
  const bgOklch: Oklch = {
    L: clampL(bgBaseL + bgContrastShift),
    C: 0.01 + sat * 0.03,
    H: effectiveHue,
  };

  // Text lightness: opposite of background for readability
  const textBaseL = isDark ? lerp(0.82, 0.95, contrast) : lerp(0.25, 0.12, contrast);
  const textOklch: Oklch = { L: textBaseL, C: 0.005 + sat * 0.01, H: effectiveHue };
  const boldOklch: Oklch = {
    L: clampL(textOklch.L + (isDark ? 0.05 : -0.05)),
    C: textOklch.C + 0.005,
    H: effectiveHue,
  };

  // Selection: slightly offset from background
  const selOffset = isDark ? 0.08 : -0.06;
  const selectionOklch: Oklch = { L: clampL(bgOklch.L + selOffset), C: bgOklch.C + 0.02, H: effectiveHue };

  const background = oklchToHex(bgOklch);
  const text = oklchToHex(textOklch);
  const bold = oklchToHex(boldOklch);
  const selection = oklchToHex(selectionOklch);
  const cursor = text;
  const cursorText = background;

  // ANSI normals — lightness adapts to background for contrast
  // Dark themes: ANSI colors are brighter; Light themes: ANSI colors are deeper
  const ansiL = isDark
    ? lerp(0.55, 0.72, contrast * 0.5)
    : lerp(0.48, 0.32, contrast * 0.5);

  // In light mode, colors need significantly higher chroma to stay vivid against
  // a bright background. Boost scales from 1× at brightness=0.5 to ~2.2× at brightness=1.
  const ansiCBase = lerp(0.08, 0.22, sat);
  const lightBoost = isDark ? 1.0 : lerp(1.0, 2.2, (bright - 0.5) * 2);
  const ansiC = ansiCBase * lightBoost;

  const normalColors: Record<string, Oklch> = {};
  for (const [name, semanticHue] of Object.entries(SEMANTIC_HUES)) {
    normalColors[name] = { L: ansiL, C: ansiC, H: semanticHue + warmth * 15 };
  }
  // ANSI "black" — lightness adapted for problematic mid-brightness range
  // At 0.3–0.5: still dark bg but needs lighter black for contrast
  // At 0.6: early light mode, needs slightly darker black
  let blackL: number;
  if (bright >= 0.3 && bright <= 0.5) {
    // Scale from normal dark (0.3 at bright=0.3) to much lighter (0.55 at bright=0.5)
    const t = (bright - 0.3) / 0.2; // 0→1 across 0.3–0.5
    blackL = lerp(0.32 + contrast * 0.08, 0.55 + contrast * 0.05, t);
  } else if (bright > 0.5 && bright <= 0.6) {
    // Scale from slightly dark (0.42 at bright=0.51) back toward normal light (0.35 at bright=0.6)
    const t = (bright - 0.5) / 0.1; // 0→1 across 0.5–0.6
    blackL = lerp(0.42 - contrast * 0.06, 0.35 - contrast * 0.08, t);
  } else {
    blackL = isDark ? lerp(0.25, 0.35, contrast) : lerp(0.35, 0.25, contrast);
  }
  normalColors['black'] = {
    L: blackL,
    C: 0.01,
    H: effectiveHue,
  };
  normalColors['white'] = {
    L: isDark ? lerp(0.70, 0.80, contrast) : lerp(0.80, 0.70, contrast),
    C: 0.01,
    H: effectiveHue,
  };

  // ANSI brights — derived from normals (direction flips for light themes)
  const brightShift = isDark ? lerp(0.08, 0.15, contrast) : lerp(-0.08, -0.13, contrast);
  const brightColors: Record<string, string> = {};
  for (const [name, oklch] of Object.entries(normalColors)) {
    const brightName = 'bright' + name.charAt(0).toUpperCase() + name.slice(1);
    brightColors[brightName] = oklchToHex({
      L: clampL(oklch.L + brightShift),
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

function clampL(l: number): number {
  return Math.max(0, Math.min(1, l));
}
