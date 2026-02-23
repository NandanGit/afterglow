export interface Oklch {
  L: number;
  C: number;
  H: number;
}

// --- Linear sRGB <-> sRGB gamma ---

function linearToGamma(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function gammaToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

// --- OKLab <-> Linear sRGB (CSS Color Level 4 matrices) ---

function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function linearSrgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

// --- Hex <-> sRGB ---

export function hexToSrgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export function srgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
  return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}

// --- sRGB <-> OKLCH ---

export function srgbToOklch(r: number, g: number, b: number): Oklch {
  const lr = gammaToLinear(r);
  const lg = gammaToLinear(g);
  const lb = gammaToLinear(b);

  const [L, a, bLab] = linearSrgbToOklab(lr, lg, lb);
  const C = Math.sqrt(a * a + bLab * bLab);
  let H = (Math.atan2(bLab, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { L, C, H };
}

export function oklchToSrgb(oklch: Oklch): [number, number, number] {
  const hRad = (oklch.H * Math.PI) / 180;
  const a = oklch.C * Math.cos(hRad);
  const b = oklch.C * Math.sin(hRad);

  const [lr, lg, lb] = oklabToLinearSrgb(oklch.L, a, b);

  return [linearToGamma(lr), linearToGamma(lg), linearToGamma(lb)];
}

// --- Convenience ---

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToSrgb(hex);
  return srgbToOklch(r, g, b);
}

export function oklchToHex(oklch: Oklch): string {
  const clamped = clampToGamut(oklch);
  const [r, g, b] = oklchToSrgb(clamped);
  return srgbToHex(r, g, b);
}

// --- Gamut clamping (binary search on chroma) ---

function isInGamut(r: number, g: number, b: number): boolean {
  const eps = 0.001;
  return r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps;
}

export function clampToGamut(oklch: Oklch): Oklch {
  const [r, g, b] = oklchToSrgb(oklch);
  if (isInGamut(r, g, b)) return oklch;

  let lo = 0;
  let hi = oklch.C;

  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const [tr, tg, tb] = oklchToSrgb({ L: oklch.L, C: mid, H: oklch.H });
    if (isInGamut(tr, tg, tb)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return { L: oklch.L, C: lo, H: oklch.H };
}
