export class TerminalRenderer {
  private container: HTMLElement;
  private outputEl: HTMLElement;
  private currentLineEl: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.outputEl = document.createElement('div');
    this.outputEl.className = 'terminal-output';
    this.container.appendChild(this.outputEl);
  }

  showPrompt(prompt: string): void {
    this.currentLineEl = document.createElement('div');
    this.currentLineEl.className = 'terminal-line terminal-prompt-line';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = prompt + ' ';
    this.currentLineEl.appendChild(promptSpan);

    const cmdSpan = document.createElement('span');
    cmdSpan.className = 'terminal-command';
    this.currentLineEl.appendChild(cmdSpan);

    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor-char';
    this.currentLineEl.appendChild(cursor);

    this.outputEl.appendChild(this.currentLineEl);
    this.scrollToBottom();
  }

  typeChar(char: string): void {
    if (!this.currentLineEl) return;
    const cmdSpan = this.currentLineEl.querySelector('.terminal-command');
    if (cmdSpan) {
      cmdSpan.textContent = (cmdSpan.textContent ?? '') + char;
    }
    this.scrollToBottom();
  }

  finishCommand(): void {
    if (this.currentLineEl) {
      const cursor = this.currentLineEl.querySelector('.terminal-cursor-char');
      if (cursor) cursor.remove();
    }
    this.currentLineEl = null;
  }

  outputLine(event: { type: string; text?: string; tokens?: { text: string; class?: string }[] }): void {
    if (event.type === 'clear') {
      this.clear();
      return;
    }
    const line = document.createElement('div');
    line.className = 'terminal-line';

    if (event.tokens) {
      for (const token of event.tokens) {
        const span = document.createElement('span');
        if (token.class) span.className = token.class;
        span.textContent = token.text;
        line.appendChild(span);
      }
    } else if (event.text !== undefined) {
      line.textContent = event.text;
    }

    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  showIdleCursor(): void {
    const line = document.createElement('div');
    line.className = 'terminal-line terminal-prompt-line';
    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = '❯ ';
    line.appendChild(promptSpan);
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor-char terminal-cursor-blink';
    line.appendChild(cursor);
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
