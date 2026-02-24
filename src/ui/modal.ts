import { createElement, $ } from '../utils/dom.ts';

export interface ModalOptions {
  title: string;
  content: string | HTMLElement;
  closeLabel?: string;
}

export function showModal(options: ModalOptions): void {
  closeModal(); // Remove any existing modal

  const overlay = createElement('div', { class: 'modal-overlay' });
  const dialog = createElement('div', { class: 'modal-dialog' });

  // Close button
  const closeBtn = createElement('button', { class: 'modal-close-btn' }, ['×']);
  closeBtn.addEventListener('click', closeModal);
  dialog.appendChild(closeBtn);

  // Title
  dialog.appendChild(createElement('h2', { class: 'modal-title' }, [options.title]));

  // Content
  const contentEl = createElement('div', { class: 'modal-content' });
  if (typeof options.content === 'string') {
    contentEl.textContent = options.content;
  } else {
    contentEl.appendChild(options.content);
  }
  dialog.appendChild(contentEl);

  // Footer button
  if (options.closeLabel) {
    const footerBtn = createElement('button', { class: 'modal-footer-btn' }, [options.closeLabel]);
    footerBtn.addEventListener('click', closeModal);
    dialog.appendChild(footerBtn);
  }

  overlay.appendChild(dialog);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
}

export function closeModal(): void {
  const existing = $('.modal-overlay');
  if (existing) existing.remove();
}
