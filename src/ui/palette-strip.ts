import { store } from '../store/store.ts';
import type { Theme } from '../types/theme.ts';
import { createElement, Star } from 'lucide';
import type { IconNode } from 'lucide';

function createStarIcon(filled: boolean): SVGElement {
  const attrs: Record<string, string> = {
    width: '16',
    height: '16',
    class: 'star-icon' + (filled ? ' star-filled' : ''),
  };
  if (filled) {
    attrs['fill'] = 'currentColor';
  }
  return createElement(Star as IconNode, attrs) as unknown as SVGElement;
}

function createColorDots(theme: Theme): HTMLElement {
  const row = document.createElement('div');
  row.className = 'card-dots';
  const slots = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'] as const;
  for (const slot of slots) {
    const dot = document.createElement('span');
    dot.className = 'card-dot';
    dot.style.backgroundColor = theme.colors[slot];
    row.appendChild(dot);
  }
  return row;
}

function createCard(theme: Theme, isActive: boolean, isFav: boolean): HTMLElement {
  const card = document.createElement('div');
  card.className = 'palette-card' + (isActive ? ' palette-card--active' : '');
  card.dataset.themeId = theme.id;

  const starBtn = document.createElement('button');
  starBtn.className = 'card-star-btn';
  starBtn.type = 'button';
  starBtn.title = isFav ? 'Remove from favorites' : 'Add to favorites';
  starBtn.appendChild(createStarIcon(isFav));
  starBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const state = store.getState();
    const newFavs = new Set(state.favorites);
    if (newFavs.has(theme.id)) {
      newFavs.delete(theme.id);
    } else {
      newFavs.add(theme.id);
    }
    store.setState({ favorites: newFavs });
  });

  const dots = createColorDots(theme);

  const info = document.createElement('div');
  info.className = 'card-info';
  info.innerHTML = `
    <span class="card-emoji">${theme.emoji}</span>
    <span class="card-name">${theme.name}</span>
    <span class="card-subtitle">${theme.subtitle}</span>
  `;

  card.appendChild(starBtn);
  card.appendChild(dots);
  card.appendChild(info);

  card.addEventListener('click', () => {
    store.setState({ activeThemeId: theme.id });
  });

  return card;
}

export function mountPaletteStrip(container: HTMLElement): () => void {
  container.innerHTML = `
    <div class="palette-strip-wrapper">
      <div class="palette-strip-header">
        <span class="palette-label">CHOOSE A PALETTE</span>
        <div class="palette-tabs">
          <button class="palette-tab palette-tab--active" data-tab="handcrafted">Default</button>
          <button class="palette-tab" data-tab="community">Community</button>
        </div>
      </div>
      <div class="palette-scroll" id="palette-scroll"></div>
      <div class="community-empty" id="community-empty" style="display:none;">
        <p class="community-empty-text">No community themes yet. Stay tuned!</p>
      </div>
    </div>
  `;

  const scroll = container.querySelector('#palette-scroll') as HTMLElement;
  const communityEmpty = container.querySelector('#community-empty') as HTMLElement;
  const tabs = container.querySelectorAll<HTMLButtonElement>('.palette-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab as 'handcrafted' | 'community';
      store.setState({ activeTab: tabName });
      tabs.forEach(t => t.classList.toggle('palette-tab--active', t === tab));
    });
  });

  function render(): void {
    const { themes, activeThemeId, favorites, activeTab } = store.getState();
    if (activeTab === 'community') {
      scroll.style.display = 'none';
      communityEmpty.style.display = 'flex';
      return;
    }
    scroll.style.display = 'flex';
    communityEmpty.style.display = 'none';
    scroll.innerHTML = '';
    for (const [, theme] of themes) {
      if (theme.source !== 'bundled') continue;
      const card = createCard(theme, theme.id === activeThemeId, favorites.has(theme.id));
      scroll.appendChild(card);
    }
  }

  render();
  const unsub = store.subscribe((state, prev) => {
    if (
      state.activeThemeId !== prev.activeThemeId ||
      state.favorites !== prev.favorites ||
      state.themes !== prev.themes ||
      state.activeTab !== prev.activeTab
    ) {
      render();
    }
  });

  return unsub;
}
