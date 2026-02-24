import { store } from '../store/store.ts';
import { $ } from '../utils/dom.ts';

export function mountHeader(container: HTMLElement): () => void {
  container.innerHTML = `
    <div class="header-inner">
      <h1 class="header-title"><span class="header-app-name">Afterglow Theme Builder</span> <span class="header-theme-name"></span></h1>
      <p class="header-subtitle">16 DEFAULT THEMES · LIVE PREVIEW · CUSTOM BUILDER</p>
    </div>
  `;

  const nameEl = $('.header-theme-name', container)!;

  function update(): void {
    const state = store.getState();
    if (state.customModeActive && state.customTheme) {
      nameEl.textContent = `· ${state.customTheme.name}`;
    } else {
      const theme = state.themes.get(state.activeThemeId);
      nameEl.textContent = theme ? `· ${theme.name}` : '';
    }
  }

  update();
  const unsub = store.subscribe(update);
  return unsub;
}
