import { store } from '../store/store.ts';
import { createElement, Minus, Plus } from 'lucide';
import type { IconNode } from 'lucide';

const FONT_FAMILIES = [
  'JetBrains Mono',
  'SF Mono',
  'Menlo',
  'Fira Code',
  'Cascadia Code',
  'Courier New',
];

export function mountFontControls(container: HTMLElement): () => void {
  const wrapper = document.createElement('div');
  wrapper.className = 'font-controls';

  // Font size stepper
  const sizeRow = document.createElement('div');
  sizeRow.className = 'font-control-row';
  const sizeLabel = document.createElement('span');
  sizeLabel.className = 'font-control-label';
  sizeLabel.textContent = 'Size';

  const sizeDown = document.createElement('button');
  sizeDown.className = 'font-step-btn';
  sizeDown.appendChild(createElement(Minus as IconNode, { width: '12', height: '12' }) as unknown as Node);
  sizeDown.addEventListener('click', () => {
    const s = store.getState();
    if (s.fontSize > 12) store.setState({ fontSize: s.fontSize - 1 });
  });

  const sizeDisplay = document.createElement('span');
  sizeDisplay.className = 'font-size-display';
  sizeDisplay.textContent = `${store.getState().fontSize}px`;

  const sizeUp = document.createElement('button');
  sizeUp.className = 'font-step-btn';
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
  const familyRow = document.createElement('div');
  familyRow.className = 'font-control-row';
  const familyLabel = document.createElement('span');
  familyLabel.className = 'font-control-label';
  familyLabel.textContent = 'Font';

  const select = document.createElement('select');
  select.className = 'font-family-select';
  for (const f of FONT_FAMILIES) {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f;
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
