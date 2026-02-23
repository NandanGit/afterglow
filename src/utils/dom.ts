export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (Node | string)[],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  if (children) {
    for (const child of children) {
      el.append(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }
  return el;
}

export function $(selector: string, parent?: Element): Element | null {
  return (parent ?? document).querySelector(selector);
}

export function $$(selector: string, parent?: Element): Element[] {
  return Array.from((parent ?? document).querySelectorAll(selector));
}
