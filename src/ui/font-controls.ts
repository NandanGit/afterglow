import { store } from '../store/store.ts';
import { createElement, Minus, Plus } from 'lucide';
import type { IconNode } from 'lucide';
import { createElement as h } from '../utils/dom.ts';

const FONT_FAMILIES = [
  'JetBrains Mono',
  'SF Mono',
  'Menlo',
  'Fira Code',
  'Cascadia Code',
  'Courier New',
];

export function mountFontControls(container: HTMLElement): () => void {
  const wrapper = h('div', { class: 'font-controls' });

  // Font size stepper
  const sizeRow = h('div', { class: 'font-control-row' });
  const sizeLabel = h('span', { class: 'font-control-label' }, ['Size']);

  const sizeDown = h('button', { class: 'font-step-btn' });
  sizeDown.appendChild(createElement(Minus as IconNode, { width: '12', height: '12' }) as unknown as Node);
  sizeDown.addEventListener('click', () => {
    const s = store.getState();
    if (s.fontSize > 12) store.setState({ fontSize: s.fontSize - 1 });
  });

  const sizeDisplay = h('span', { class: 'font-size-display' }, [`${store.getState().fontSize}px`]);

  const sizeUp = h('button', { class: 'font-step-btn' });
  sizeUp.appendChild(createElement(Plus as IconNode, { width: '12', height: '12' }) as unknown as Node);
  sizeUp.addEventListener('click', () => {
    const s = store.getState();
    if (s.fontSize < 16) store.setState({ fontSize: s.fontSize + 1 });
  });

  sizeRow.appendChild(sizeLabel);
  sizeRow.appendChild(sizeDown);
  sizeRow.appendChild(sizeDisplay);
  sizeRow.appendChild(sizeUp);
  wrapper.appendChild(sizeRow);

  // Font family dropdown
  const familyRow = h('div', { class: 'font-control-row' });
  const familyLabel = h('span', { class: 'font-control-label' }, ['Font']);

  const select = h('select', { class: 'font-family-select' });
  for (const f of FONT_FAMILIES) {
    const opt = h('option', { value: f }, [f]);
    if (f === store.getState().fontFamily) opt.selected = true;
    select.appendChild(opt);
  }
  select.addEventListener('change', () => {
    store.setState({ fontFamily: select.value });
  });

  familyRow.appendChild(familyLabel);
  familyRow.appendChild(select);
  wrapper.appendChild(familyRow);

  container.appendChild(wrapper);

  const unsub = store.subscribe((state, prev) => {
    if (state.fontSize !== prev.fontSize) {
      sizeDisplay.textContent = `${state.fontSize}px`;
    }
    if (state.fontFamily !== prev.fontFamily) {
      select.value = state.fontFamily;
    }
  });

  return unsub;
}
