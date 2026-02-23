import type { Theme } from '../../types/theme.ts';
import { encodeNSColor, encodeNSFont } from '../plist.ts';

export interface TerminalExportOptions {
  fontName?: string;
  fontSize?: number;
  columns?: number;
  rows?: number;
  cursorType?: number;
  cursorBlink?: boolean;
}

function base64Encode(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const COLOR_MAP: Record<string, string> = {
  background: 'BackgroundColor',
  text: 'TextColor',
  bold: 'TextBoldColor',
  selection: 'SelectionColor',
  cursor: 'CursorColor',
  cursorText: 'CursorTextColor',
  black: 'ANSIBlackColor',
  red: 'ANSIRedColor',
  green: 'ANSIGreenColor',
  yellow: 'ANSIYellowColor',
  blue: 'ANSIBlueColor',
  magenta: 'ANSIMagentaColor',
  cyan: 'ANSICyanColor',
  white: 'ANSIWhiteColor',
  brightBlack: 'ANSIBrightBlackColor',
  brightRed: 'ANSIBrightRedColor',
  brightGreen: 'ANSIBrightGreenColor',
  brightYellow: 'ANSIBrightYellowColor',
  brightBlue: 'ANSIBrightBlueColor',
  brightMagenta: 'ANSIBrightMagentaColor',
  brightCyan: 'ANSIBrightCyanColor',
  brightWhite: 'ANSIBrightWhiteColor',
};

export function serializeTerminal(theme: Theme, options?: TerminalExportOptions): string {
  const fontName = options?.fontName ?? 'JetBrainsMono-Regular';
  const fontSize = options?.fontSize ?? 14;
  const columns = options?.columns ?? 220;
  const rows = options?.rows ?? 50;
  const cursorType = options?.cursorType ?? 0;
  const cursorBlink = options?.cursorBlink ?? true;

  let dictEntries = '';

  // Colors
  for (const [slotKey, plistKey] of Object.entries(COLOR_MAP)) {
    const hex = theme.colors[slotKey as keyof typeof theme.colors];
    const colorData = encodeNSColor(hex);
    const b64 = base64Encode(colorData);
    dictEntries += `\t\t<key>${xmlEscape(plistKey)}</key>\n`;
    dictEntries += `\t\t<data>\n\t\t${b64}\n\t\t</data>\n`;
  }

  // Font
  const fontData = encodeNSFont(fontName, fontSize);
  const fontB64 = base64Encode(fontData);
  dictEntries += `\t\t<key>Font</key>\n`;
  dictEntries += `\t\t<data>\n\t\t${fontB64}\n\t\t</data>\n`;

  // Window settings
  dictEntries += `\t\t<key>columnCount</key>\n\t\t<integer>${columns}</integer>\n`;
  dictEntries += `\t\t<key>rowCount</key>\n\t\t<integer>${rows}</integer>\n`;
  dictEntries += `\t\t<key>CursorType</key>\n\t\t<integer>${cursorType}</integer>\n`;
  dictEntries += `\t\t<key>CursorBlink</key>\n\t\t<${cursorBlink}/>\n`;

  // Theme name
  dictEntries += `\t\t<key>name</key>\n\t\t<string>${xmlEscape(theme.name)}</string>\n`;
  dictEntries += `\t\t<key>type</key>\n\t\t<string>Window Settings</string>\n`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
\t<dict>
${dictEntries}\t</dict>
</plist>
`;
}
