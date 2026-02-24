import { store } from '../store/store.ts';
import { editColor, toggleLock, toggleGlobalLock } from '../store/store.ts';
import type { ThemeColors, ColorSlotId, AnsiNormalSlot } from '../types/theme.ts';
import { contrastRatio, wcagLevel } from '../color/contrast.ts';
import { copyToClipboard } from '../utils/clipboard.ts';
import { exportTheme, copyCssVars } from '../export/exporter.ts';
import type { ExportFormat } from '../export/exporter.ts';
import { createElement, Download, ClipboardCopy, Link, Unlink, Lock, Unlock } from 'lucide';
import type { IconNode } from 'lucide';
import { createElement as h, $ } from '../utils/dom.ts';

const NORMAL_SLOT_KEYS: AnsiNormalSlot[] = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

const CORE_SLOTS: { id: ColorSlotId; label: string }[] = [
  { id: 'background', label: 'Background' },
  { id: 'text', label: 'Text' },
  { id: 'bold', label: 'Bold' },
  { id: 'selection', label: 'Selection' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'cursorText', label: 'Cursor Text' },
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
  const existing = $('.swatch-tooltip', el);
  if (existing) existing.remove();
  const tip = h('span', { class: 'swatch-tooltip' }, [text]);
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
  editable: boolean,
): HTMLElement {
  const wrapper = h('div', { class: `swatch-wrapper ${className}` });
  const swatch = h('div', { class: 'swatch' + (editable ? ' swatch--editable' : '') });
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
    const existing = $('.swatch-tooltip', wrapper);
    if (existing) existing.remove();
    const tip = h('span', { class: 'swatch-tooltip swatch-tooltip--hover' }, [text]);
    wrapper.appendChild(tip);
    requestAnimationFrame(() => tip.classList.add('swatch-tooltip--visible'));
  });

  wrapper.addEventListener('mouseleave', () => {
    const tip = $('.swatch-tooltip--hover', wrapper);
    if (tip) tip.remove();
  });

  if (editable) {
    // In custom mode: click opens native color picker
    const colorInput = h('input', { type: 'color', class: 'custom-color-input', value: color });
    colorInput.addEventListener('input', () => {
      editColor(slotId, colorInput.value);
    });
    swatch.addEventListener('click', () => colorInput.click());
    wrapper.appendChild(colorInput);
  } else {
    // Click to copy
    swatch.addEventListener('click', () => {
      void copyToClipboard(color.toUpperCase()).then(() => {
        showTooltip(wrapper, 'Copied!');
      });
    });
  }

  const nameEl = h('span', { class: 'swatch-label' }, [label]);

  wrapper.appendChild(swatch);
  if (isCore) wrapper.appendChild(nameEl);
  return wrapper;
}

function renderSwatches(container: HTMLElement, colors: ThemeColors): void {
  container.innerHTML = '';
  const bgHex = colors.background;
  const state = store.getState();
  const editable = state.customModeActive;

  // Core colors
  container.appendChild(h('h3', { class: 'section-label' }, ['TERMINAL CORE']));

  const coreRow = h('div', { class: 'swatch-row swatch-row--core' });
  for (const slot of CORE_SLOTS) {
    coreRow.appendChild(createSwatch(slot.id, slot.label, colors[slot.id], 'swatch-core', bgHex, true, editable));
  }
  container.appendChild(coreRow);

  // Normal colors header (with global lock button in custom mode)
  const normalHeader = h('div', { class: editable ? 'section-label-row' : '' });
  normalHeader.appendChild(h('h3', { class: 'section-label' }, ['NORMAL COLORS']));

  if (editable) {
    const globalLockBtn = h('button', {
      class: 'custom-global-lock-btn',
      title: state.globalLock ? 'Unlock all pairs' : 'Lock all pairs',
    });
    const lockIcon = createElement(
      (state.globalLock ? Lock : Unlock) as IconNode,
      { width: '12', height: '12' }
    ) as unknown as Node;
    globalLockBtn.appendChild(lockIcon);
    globalLockBtn.appendChild(document.createTextNode(state.globalLock ? ' Linked' : ' Unlinked'));
    globalLockBtn.addEventListener('click', () => toggleGlobalLock());
    normalHeader.appendChild(globalLockBtn);
  }
  container.appendChild(normalHeader);

  const normalRow = h('div', { class: 'swatch-row swatch-row--ansi' });
  for (const slot of NORMAL_SLOTS) {
    normalRow.appendChild(createSwatch(slot.id, slot.label, colors[slot.id], 'swatch-ansi', bgHex, false, editable));
  }
  container.appendChild(normalRow);

  // Per-pair link buttons between normal and bright (custom mode only)
  if (editable) {
    const linkRow = h('div', { class: 'custom-link-row' });
    for (const ns of NORMAL_SLOT_KEYS) {
      const linkBtn = h('button', {
        class: 'custom-link-btn' + (state.locks[ns] ? ' custom-link-btn--active' : ''),
        title: state.locks[ns] ? 'Unlink pair' : 'Link pair',
      });
      const ico = createElement(
        (state.locks[ns] ? Link : Unlink) as IconNode,
        { width: '12', height: '12' }
      ) as unknown as Node;
      linkBtn.appendChild(ico);
      linkBtn.addEventListener('click', () => toggleLock(ns));
      linkRow.appendChild(linkBtn);
    }
    container.appendChild(linkRow);
  }

  // Bright colors
  container.appendChild(h('h3', { class: 'section-label' }, ['BRIGHT COLORS']));

  const brightRow = h('div', { class: 'swatch-row swatch-row--ansi' });
  for (const slot of BRIGHT_SLOTS) {
    brightRow.appendChild(createSwatch(slot.id, slot.label, colors[slot.id], 'swatch-ansi', bgHex, false, editable));
  }
  container.appendChild(brightRow);

  // Export buttons for preset themes
  if (!state.customModeActive) {
    container.appendChild(h('h3', { class: 'section-label' }, ['EXPORT']));

    const exportRow = h('div', { class: 'custom-export-row' });
    const exportGroup = h('div', { class: 'custom-export-group' });
    const exportBtn = h('button', { class: 'custom-export-btn' });
    const dlIcon = createElement(Download as IconNode, { width: '14', height: '14' });
    exportBtn.appendChild(dlIcon as unknown as Node);
    exportBtn.appendChild(document.createTextNode(' Export'));

    const dropdown = h('div', { class: 'custom-export-dropdown', style: 'display:none' });

    const formats: { label: string; format: ExportFormat }[] = [
      { label: '.terminal (macOS)', format: 'terminal' },
      { label: '.json (Raw JSON)', format: 'json' },
      { label: '.css (CSS Variables)', format: 'css' },
    ];

    for (const { label, format } of formats) {
      const item = h('button', { class: 'custom-export-dropdown-item' }, [label]);
      item.addEventListener('click', () => {
        dropdown.style.display = 'none';
        const theme = state.themes.get(state.activeThemeId);
        if (theme) exportTheme(theme, format);
      });
      dropdown.appendChild(item);
    }

    exportBtn.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
    });
    const closeDropdown = (e: MouseEvent) => {
      if (!exportGroup.contains(e.target as Node)) {
        dropdown.style.display = 'none';
        document.removeEventListener('click', closeDropdown);
      }
    };
    exportBtn.addEventListener('click', () => {
      setTimeout(() => document.addEventListener('click', closeDropdown), 0);
    });

    exportGroup.appendChild(exportBtn);
    exportGroup.appendChild(dropdown);
    exportRow.appendChild(exportGroup);

    const copyBtn = h('button', { class: 'custom-copy-btn' });
    const cpIcon = createElement(ClipboardCopy as IconNode, { width: '14', height: '14' });
    copyBtn.appendChild(cpIcon as unknown as Node);
    copyBtn.appendChild(document.createTextNode(' Copy CSS'));
    copyBtn.addEventListener('click', () => {
      const theme = state.themes.get(state.activeThemeId);
      if (theme) void copyCssVars(theme);
    });
    exportRow.appendChild(copyBtn);

    container.appendChild(exportRow);
  }
}

export function mountColorDisplay(container: HTMLElement): () => void {
  function update(): void {
    const state = store.getState();
    const theme = state.customModeActive && state.customTheme
      ? state.customTheme
      : state.themes.get(state.activeThemeId);
    if (!theme) return;
    renderSwatches(container, theme.colors);
  }

  update();
  const unsub = store.subscribe((state, prev) => {
    if (
      state.activeThemeId !== prev.activeThemeId ||
      state.themes !== prev.themes ||
      state.customModeActive !== prev.customModeActive ||
      state.customTheme !== prev.customTheme ||
      state.locks !== prev.locks ||
      state.globalLock !== prev.globalLock
    ) {
      update();
    }
  });

  return unsub;
}
