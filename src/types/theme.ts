export interface ThemeColors {
  background: string;
  text: string;
  bold: string;
  selection: string;
  cursor: string;
  cursorText: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export interface Theme {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  colors: ThemeColors;
  source: 'bundled' | 'community' | 'custom';
}

export type ColorSlotId = keyof ThemeColors;
export type CoreColorSlot = 'background' | 'text' | 'bold' | 'selection';
export type AnsiNormalSlot = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';
export type AnsiBrightSlot = 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow' | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite';

export const NORMAL_TO_BRIGHT: Record<AnsiNormalSlot, AnsiBrightSlot> = {
  black: 'brightBlack',
  red: 'brightRed',
  green: 'brightGreen',
  yellow: 'brightYellow',
  blue: 'brightBlue',
  magenta: 'brightMagenta',
  cyan: 'brightCyan',
  white: 'brightWhite',
};
