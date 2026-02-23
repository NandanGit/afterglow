import type { Theme, ColorSlotId, ThemeColors } from '../types/theme.ts';
import type { CustomControls } from '../store/store.ts';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const CURRENT_VERSION = '02';
const SEPARATOR = '-';

const SLOT_ORDER: ColorSlotId[] = [
  'background', 'text', 'bold', 'selection', 'cursor', 'cursorText',
  'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
];

export interface DecodedShare {
  theme: Theme;
  controls?: CustomControls;
}

export function encodeThemeToURL(theme: Theme, controls?: CustomControls): string {
  const hexValues = SLOT_ORDER.map(slot => theme.colors[slot].replace('#', '')).join('');
  const ctrlStr = controls
    ? `\x01${controls.hue.toFixed(2)},${controls.warmth.toFixed(2)},${controls.saturation.toFixed(2)},${controls.contrast.toFixed(2)}`
    : '';
  const payload = theme.name + '\0' + hexValues + ctrlStr;
  const compressed = compressToEncodedURIComponent(payload);
  return `${CURRENT_VERSION}${SEPARATOR}${compressed}`;
}

export function decodeThemeFromURL(param: string): DecodedShare | null {
  const sepIdx = param.indexOf(SEPARATOR);
  if (sepIdx === -1) return null;

  const version = param.slice(0, sepIdx);
  const data = param.slice(sepIdx + 1);

  switch (version) {
    case '01':
      return decodeV1(data);
    case '02':
      return decodeV2(data);
    default:
      return null;
  }
}

function decodeColors(hexString: string): ThemeColors | null {
  if (hexString.length !== SLOT_ORDER.length * 6) return null;
  const colors: Partial<ThemeColors> = {};
  for (let i = 0; i < SLOT_ORDER.length; i++) {
    colors[SLOT_ORDER[i]] = '#' + hexString.slice(i * 6, (i + 1) * 6);
  }
  return colors as ThemeColors;
}

function makeTheme(name: string, colors: ThemeColors): Theme {
  return { id: 'shared', name, subtitle: 'Shared theme', emoji: '🔗', colors, source: 'custom' };
}

function decodeV1(data: string): DecodedShare | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(data);
    if (!decompressed) return null;
    const nullIdx = decompressed.indexOf('\0');
    if (nullIdx === -1) return null;
    const name = decompressed.slice(0, nullIdx);
    const colors = decodeColors(decompressed.slice(nullIdx + 1));
    if (!colors) return null;
    return { theme: makeTheme(name, colors) };
  } catch {
    return null;
  }
}

function decodeV2(data: string): DecodedShare | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(data);
    if (!decompressed) return null;
    const nullIdx = decompressed.indexOf('\0');
    if (nullIdx === -1) return null;
    const name = decompressed.slice(0, nullIdx);
    const rest = decompressed.slice(nullIdx + 1);

    const ctrlSep = rest.indexOf('\x01');
    const hexString = ctrlSep === -1 ? rest : rest.slice(0, ctrlSep);
    const colors = decodeColors(hexString);
    if (!colors) return null;

    let controls: CustomControls | undefined;
    if (ctrlSep !== -1) {
      const parts = rest.slice(ctrlSep + 1).split(',').map(Number);
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        controls = { hue: parts[0], warmth: parts[1], saturation: parts[2], contrast: parts[3] };
      }
    }

    return { theme: makeTheme(name, colors), controls };
  } catch {
    return null;
  }
}
