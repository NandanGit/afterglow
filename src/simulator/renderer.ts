import { createElement, $ } from '../utils/dom.ts';

export class TerminalRenderer {
  private container: HTMLElement;
  private outputEl: HTMLElement;
  private currentLineEl: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.outputEl = createElement('div', { class: 'terminal-output' });
    this.container.appendChild(this.outputEl);
  }

  showPrompt(prompt: string): void {
    this.currentLineEl = createElement('div', { class: 'terminal-line terminal-prompt-line' }, [
      createElement('span', { class: 'terminal-prompt' }, [prompt + ' ']),
      createElement('span', { class: 'terminal-command' }),
      createElement('span', { class: 'terminal-cursor-char' }),
    ]);

    this.outputEl.appendChild(this.currentLineEl);
    this.scrollToBottom();
  }

  typeChar(char: string): void {
    if (!this.currentLineEl) return;
    const cmdSpan = $('.terminal-command', this.currentLineEl);
    if (cmdSpan) {
      cmdSpan.textContent = (cmdSpan.textContent ?? '') + char;
    }
    this.scrollToBottom();
  }

  finishCommand(): void {
    if (this.currentLineEl) {
      const cursor = $('.terminal-cursor-char', this.currentLineEl);
      if (cursor) cursor.remove();
    }
    this.currentLineEl = null;
  }

  outputLine(event: { type: string; text?: string; tokens?: { text: string; class?: string }[] }): void {
    if (event.type === 'clear') {
      this.clear();
      return;
    }
    const line = createElement('div', { class: 'terminal-line' });

    if (event.tokens) {
      for (const token of event.tokens) {
        line.appendChild(createElement('span', token.class ? { class: token.class } : {}, [token.text]));
      }
    } else if (event.text !== undefined) {
      line.textContent = event.text;
    }

    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  showIdleCursor(): void {
    const line = createElement('div', { class: 'terminal-line terminal-prompt-line' }, [
      createElement('span', { class: 'terminal-prompt' }, ['❯ ']),
      createElement('span', { class: 'terminal-cursor-char terminal-cursor-blink' }),
    ]);
    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  clear(): void {
    this.outputEl.innerHTML = '';
    this.currentLineEl = null;
  }

  setFontSize(size: number): void {
    this.container.style.fontSize = size + 'px';
  }

  setFontFamily(family: string): void {
    this.container.style.fontFamily = `'${family}', monospace`;
  }

  destroy(): void {
    this.outputEl.remove();
  }

  private scrollToBottom(): void {
    const el = this.outputEl;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
