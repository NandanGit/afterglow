import { store } from '../store/store.ts';
import type { ThemeColors, ColorSlotId } from '../types/theme.ts';
import { contrastRatio, wcagLevel } from '../color/contrast.ts';
import { copyToClipboard } from '../utils/clipboard.ts';

const CORE_SLOTS: { id: ColorSlotId; label: string }[] = [
  { id: 'background', label: 'Background' },
  { id: 'text', label: 'Text' },
  { id: 'bold', label: 'Bold' },
  { id: 'selection', label: 'Selection' },
];

const NORMAL_SLOTS: { id: ColorSlotId; label: string }[] = [
  { id: 'black', label: 'Black' },
  { id: 'red', label: 'Red' },
  { id: 'green', label: 'Green' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'blue', label: 'Blue' },
  { id: 'magenta', label: 'Magenta' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'white', label: 'White' },
];

const BRIGHT_SLOTS: { id: ColorSlotId; label: string }[] = [
  { id: 'brightBlack', label: 'Bright Black' },
  { id: 'brightRed', label: 'Bright Red' },
  { id: 'brightGreen', label: 'Bright Green' },
  { id: 'brightYellow', label: 'Bright Yellow' },
  { id: 'brightBlue', label: 'Bright Blue' },
  { id: 'brightMagenta', label: 'Bright Magenta' },
  { id: 'brightCyan', label: 'Bright Cyan' },
  { id: 'brightWhite', label: 'Bright White' },
];

function showTooltip(el: HTMLElement, text: string): void {
  const existing = el.querySelector('.swatch-tooltip');
  if (existing) existing.remove();
  const tip = document.createElement('span');
  tip.className = 'swatch-tooltip';
  tip.textContent = text;
  el.appendChild(tip);
  requestAnimationFrame(() => tip.classList.add('swatch-tooltip--visible'));
  setTimeout(() => {
    tip.classList.remove('swatch-tooltip--visible');
    setTimeout(() => tip.remove(), 200);
  }, 1500);
}

function buildCoreTooltip(label: string, hex: string, bgHex: string, isBackground: boolean): string {
  const upper = hex.toUpperCase();
  if (isBackground) return `${label} · ${upper}`;
  const ratio = contrastRatio(hex, bgHex);
  const level = wcagLevel(ratio);
  return `${label} · ${upper} · ${ratio.toFixed(1)}:1 ${level}`;
}

function createSwatch(
  slotId: ColorSlotId,
  label: string,
  color: string,
  className: string,
  bgHex: string,
  isCore: boolean,
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = `swatch-wrapper ${className}`;

  const swatch = document.createElement('div');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = color;

  // Hover tooltip
  wrapper.addEventListener('mouseenter', () => {
    const upper = color.toUpperCase();
    let text: string;
    if (isCore) {
      text = buildCoreTooltip(label, color, bgHex, slotId === 'background');
    } else {
      text = `${label} · ${upper}`;
    }
    const existing = wrapper.querySelector('.swatch-tooltip');
    if (existing) existing.remove();
    const tip = document.createElement('span');
    tip.className = 'swatch-tooltip swatch-tooltip--hover';
    tip.textContent = text;
    wrapper.appendChild(tip);
    requestAnimationFrame(() => tip.classList.add('swatch-tooltip--visible'));
  });

  wrapper.addEventListener('mouseleave', () => {
    const tip = wrapper.querySelector('.swatch-tooltip--hover');
    if (tip) tip.remove();
  });

  // Click to copy
  swatch.addEventListener('click', () => {
    void copyToClipboard(color.toUpperCase()).then(() => {
      showTooltip(wrapper, 'Copied!');
    });
  });

  const nameEl = document.createElement('span');
  nameEl.className = 'swatch-label';
  nameEl.textContent = label;

  wrapper.appendChild(swatch);
  if (isCore) wrapper.appendChild(nameEl);
  return wrapper;
}

function renderSwatches(container: HTMLElement, colors: ThemeColors): void {
  container.innerHTML = '';
  const bgHex = colors.background;

  // Core colors
  const coreLabel = document.createElement('h3');
  coreLabel.className = 'section-label';
  coreLabel.textContent = 'TERMINAL CORE';
  container.appendChild(coreLabel);

  const coreRow = document.createElement('div');
  coreRow.className = 'swatch-row swatch-row--core';
  for (const slot of CORE_SLOTS) {
    coreRow.appendChild(createSwatch(slot.id, slot.label, colors[slot.id], 'swatch-core', bgHex, true));
  }
  container.appendChild(coreRow);

  // Normal colors
  const normalLabel = document.createElement('h3');
  normalLabel.className = 'section-label';
  normalLabel.textContent = 'NORMAL COLORS';
  container.appendChild(normalLabel);

  const normalRow = document.createElement('div');
  normalRow.className = 'swatch-row swatch-row--ansi';
  for (const slot of NORMAL_SLOTS) {
    normalRow.appendChild(createSwatch(slot.id, slot.label, colors[slot.id], 'swatch-ansi', bgHex, false));
  }
  container.appendChild(normalRow);

  // Bright colors
  const brightLabel = document.createElement('h3');
  brightLabel.className = 'section-label';
  brightLabel.textContent = 'BRIGHT COLORS';
  container.appendChild(brightLabel);

  const brightRow = document.createElement('div');
  brightRow.className = 'swatch-row swatch-row--ansi';
  for (const slot of BRIGHT_SLOTS) {
    brightRow.appendChild(createSwatch(slot.id, slot.label, colors[slot.id], 'swatch-ansi', bgHex, false));
  }
  container.appendChild(brightRow);
}

export function mountColorDisplay(container: HTMLElement): () => void {
  function update(): void {
    const { activeThemeId, themes } = store.getState();
    const theme = themes.get(activeThemeId);
    if (!theme) return;
    renderSwatches(container, theme.colors);
  }

  update();
  const unsub = store.subscribe((state, prev) => {
    if (state.activeThemeId !== prev.activeThemeId || state.themes !== prev.themes) {
      update();
    }
  });

  return unsub;
}
