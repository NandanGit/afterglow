import { store } from '../store/store.ts';

export function mountHeader(container: HTMLElement): () => void {
  container.innerHTML = `
    <div class="header-inner">
      <h1 class="header-title"><span class="header-app-name">Afterglow Theme Builder</span> <span class="header-theme-name"></span></h1>
      <p class="header-subtitle">16 DEFAULT THEMES · LIVE PREVIEW · CUSTOM BUILDER</p>
    </div>
  `;

  const nameEl = container.querySelector('.header-theme-name')!;

  function update(): void {
    const { activeThemeId, themes } = store.getState();
    const theme = themes.get(activeThemeId);
    nameEl.textContent = theme ? `· ${theme.name}` : '';
  }

  update();
  const unsub = store.subscribe(update);
  return unsub;
}
