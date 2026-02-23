export interface ModalOptions {
  title: string;
  content: string | HTMLElement;
  closeLabel?: string;
}

export function showModal(options: ModalOptions): void {
  closeModal(); // Remove any existing modal

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close-btn';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeModal);
  dialog.appendChild(closeBtn);

  // Title
  const titleEl = document.createElement('h2');
  titleEl.className = 'modal-title';
  titleEl.textContent = options.title;
  dialog.appendChild(titleEl);

  // Content
  const contentEl = document.createElement('div');
  contentEl.className = 'modal-content';
  if (typeof options.content === 'string') {
    contentEl.textContent = options.content;
  } else {
    contentEl.appendChild(options.content);
  }
  dialog.appendChild(contentEl);

  // Footer button
  if (options.closeLabel) {
    const footerBtn = document.createElement('button');
    footerBtn.className = 'modal-footer-btn';
    footerBtn.textContent = options.closeLabel;
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
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();
}
