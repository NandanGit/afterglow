import { store } from '../store/store.ts';
import type { Theme } from '../types/theme.ts';
import { SimulatorEngine } from '../simulator/engine.ts';
import { TerminalRenderer } from '../simulator/renderer.ts';
import { scenarios } from '../simulator/scenarios/index.ts';

export function mountComparison(container: HTMLElement): () => void {
  let rendererA: TerminalRenderer | null = null;
  let rendererB: TerminalRenderer | null = null;
  let engine: SimulatorEngine | null = null;
  let isDragging = false;

  function applyThemeVarsToEl(el: HTMLElement, theme: Theme): void {
    for (const [key, value] of Object.entries(theme.colors)) {
      const cssVar = `--theme-${key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`;
      el.style.setProperty(cssVar, value);
    }
  }

  function render(): void {
    const state = store.getState();
    container.innerHTML = '';

    if (!state.comparisonEnabled) return;

    container.className = 'comparison-container';

    // Theme selector
    const selector = document.createElement('div');
    selector.className = 'comparison-selector';
    const label = document.createElement('span');
    label.className = 'comparison-label';
    label.textContent = 'Compare with:';
    selector.appendChild(label);

    const select = document.createElement('select');
    select.className = 'comparison-select';
    for (const [id, theme] of state.themes) {
      if (id === state.activeThemeId) continue;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = theme.name;
      if (id === state.comparisonThemeId) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', () => {
      store.setState({ comparisonThemeId: select.value });
    });
    selector.appendChild(select);
    container.appendChild(selector);

    // Comparison viewport
    const viewport = document.createElement('div');
    viewport.className = 'comparison-viewport';

    // Side A (active theme)
    const sideA = document.createElement('div');
    sideA.className = 'comparison-side comparison-side-a';
    const terminalA = createTerminalWindow();
    sideA.appendChild(terminalA.window);

    // Side B (comparison theme — clipped)
    const sideB = document.createElement('div');
    sideB.className = 'comparison-side comparison-side-b';
    const terminalB = createTerminalWindow();
    sideB.appendChild(terminalB.window);

    // Apply themes
    const activeTheme = state.customModeActive && state.customTheme
      ? state.customTheme
      : state.themes.get(state.activeThemeId);
    const compTheme = state.comparisonThemeId
      ? state.themes.get(state.comparisonThemeId)
      : null;

    if (activeTheme) applyThemeVarsToEl(sideA, activeTheme);
    if (compTheme) applyThemeVarsToEl(sideB, compTheme);

    // Slider bar
    const slider = document.createElement('div');
    slider.className = 'comparison-slider';

    viewport.appendChild(sideA);
    viewport.appendChild(sideB);
    viewport.appendChild(slider);
    container.appendChild(viewport);

    // Set initial clip position
    const updateClip = (pct: number) => {
      sideB.style.clipPath = `inset(0 0 0 ${pct}%)`;
      slider.style.left = `${pct}%`;
    };
    updateClip(state.sliderPosition);

    // Drag handling
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const rect = viewport.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      updateClip(pct);
      store.setState({ sliderPosition: pct });
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    slider.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    // Set up renderers and engine
    rendererA = new TerminalRenderer(terminalA.content);
    rendererB = new TerminalRenderer(terminalB.content);

    engine = new SimulatorEngine({
      onPrompt: (prompt) => { rendererA?.showPrompt(prompt); rendererB?.showPrompt(prompt); },
      onTypeChar: (char) => { rendererA?.typeChar(char); rendererB?.typeChar(char); },
      onOutputLine: (event) => { rendererA?.outputLine(event); rendererB?.outputLine(event); },
      onComplete: () => { rendererA?.showIdleCursor(); rendererB?.showIdleCursor(); },
      onClear: () => { rendererA?.clear(); rendererB?.clear(); },
      onFinishCommand: () => { rendererA?.finishCommand(); rendererB?.finishCommand(); },
    });

    const scenario = scenarios[state.activeScenario];
    engine.load(scenario);
    engine.setSpeed(state.speed);
    engine.setLooping(state.looping);
    engine.play();
  }

  function createTerminalWindow(): { window: HTMLElement; content: HTMLElement } {
    const win = document.createElement('div');
    win.className = 'terminal-window';
    win.style.userSelect = 'none';

    const titlebar = document.createElement('div');
    titlebar.className = 'terminal-titlebar';
    const dots = document.createElement('div');
    dots.className = 'terminal-dots';
    dots.innerHTML = '<span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>';
    titlebar.appendChild(dots);
    win.appendChild(titlebar);

    const content = document.createElement('div');
    content.className = 'terminal-content';
    win.appendChild(content);

    return { window: win, content };
  }

  function cleanup(): void {
    if (engine) { engine.destroy(); engine = null; }
    if (rendererA) { rendererA.destroy(); rendererA = null; }
    if (rendererB) { rendererB.destroy(); rendererB = null; }
  }

  render();

  const unsub = store.subscribe((state, prev) => {
    if (
      state.comparisonEnabled !== prev.comparisonEnabled ||
      state.comparisonThemeId !== prev.comparisonThemeId ||
      state.activeThemeId !== prev.activeThemeId
    ) {
      cleanup();
      render();
    }
  });

  return () => {
    cleanup();
    unsub();
  };
}
