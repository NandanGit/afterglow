import { store } from '../store/store.ts';
import type { ScenarioId } from '../store/store.ts';
import { SimulatorEngine } from '../simulator/engine.ts';
import { TerminalRenderer } from '../simulator/renderer.ts';
import { scenarios } from '../simulator/scenarios/index.ts';
import { createElement, RotateCw, Columns2 } from 'lucide';
import type { IconNode } from 'lucide';

const SCENARIO_TABS: { id: ScenarioId; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'git', label: 'GIT' },
  { id: 'python', label: 'PYTHON' },
  { id: 'logs', label: 'LOGS' },
  { id: 'system', label: 'SYSTEM' },
  { id: 'docker', label: 'DOCKER' },
  { id: 'files', label: 'FILES' },
  { id: 'build', label: 'BUILD' },
  { id: 'ssh', label: 'SSH' },
];

export function mountPreview(container: HTMLElement): () => void {
  container.innerHTML = `
    <div class="preview-wrapper">
      <div class="preview-controls">
        <div class="scenario-tabs" id="scenario-tabs"></div>
        <div class="speed-controls">
          <button class="speed-btn" id="speed-down">−</button>
          <span class="speed-display" id="speed-display">1.0x</span>
          <button class="speed-btn" id="speed-up">+</button>
          <button class="loop-btn" id="loop-btn" title="Toggle loop"></button>
          <button class="compare-btn" id="compare-btn" title="Comparison mode"></button>
        </div>
      </div>
      <div class="terminal-window">
        <div class="terminal-titlebar">
          <div class="terminal-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <span class="terminal-title" id="terminal-title"></span>
        </div>
        <div class="terminal-content" id="terminal-content"></div>
      </div>
    </div>
  `;

  // Elements
  const tabsEl = container.querySelector('#scenario-tabs') as HTMLElement;
  const speedDisplay = container.querySelector('#speed-display') as HTMLElement;
  const speedDown = container.querySelector('#speed-down') as HTMLElement;
  const speedUp = container.querySelector('#speed-up') as HTMLElement;
  const loopBtn = container.querySelector('#loop-btn') as HTMLElement;
  const compareBtn = container.querySelector('#compare-btn') as HTMLElement;
  const titleEl = container.querySelector('#terminal-title') as HTMLElement;
  const contentEl = container.querySelector('#terminal-content') as HTMLElement;

  // Renderer & Engine
  const renderer = new TerminalRenderer(contentEl);
  const engine = new SimulatorEngine({
    onPrompt: (prompt) => renderer.showPrompt(prompt),
    onTypeChar: (char) => renderer.typeChar(char),
    onOutputLine: (event) => renderer.outputLine(event),
    onComplete: () => renderer.showIdleCursor(),
    onClear: () => renderer.clear(),
    onFinishCommand: () => renderer.finishCommand(),
  });

  // Apply font settings
  const { fontSize, fontFamily } = store.getState();
  renderer.setFontSize(fontSize);
  renderer.setFontFamily(fontFamily);

  // Build scenario tabs
  function renderTabs(): void {
    const activeScenario = store.getState().activeScenario;
    tabsEl.innerHTML = '';
    for (const tab of SCENARIO_TABS) {
      const btn = document.createElement('button');
      btn.className = 'scenario-tab' + (tab.id === activeScenario ? ' scenario-tab--active' : '');
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        store.setState({ activeScenario: tab.id });
      });
      tabsEl.appendChild(btn);
    }
  }

  // Icons for loop and compare buttons
  function renderLoopBtn(): void {
    const { looping } = store.getState();
    loopBtn.innerHTML = '';
    const icon = createElement(RotateCw as IconNode, {
      width: '16', height: '16',
      class: looping ? 'icon-active' : 'icon-dim',
    });
    loopBtn.appendChild(icon as unknown as Node);
  }

  function renderCompareBtn(): void {
    const { comparisonEnabled } = store.getState();
    compareBtn.innerHTML = '';
    const icon = createElement(Columns2 as IconNode, {
      width: '16', height: '16', class: comparisonEnabled ? 'icon-active' : 'icon-dim',
    });
    compareBtn.appendChild(icon as unknown as Node);
  }

  // Load and play scenario
  function loadScenario(id: ScenarioId): void {
    const scenario = scenarios[id];
    titleEl.textContent = scenario.windowTitle;
    renderer.clear();
    engine.load(scenario);
    engine.setSpeed(store.getState().speed);
    engine.setLooping(store.getState().looping);
    engine.play();
  }

  // Initialize
  renderTabs();
  renderLoopBtn();
  renderCompareBtn();
  loadScenario(store.getState().activeScenario);

  // Speed controls
  speedDown.addEventListener('click', () => {
    const current = store.getState().speed;
    const newSpeed = Math.max(0, Math.round((current - 0.1) * 10) / 10);
    store.setState({ speed: newSpeed });
  });
  speedUp.addEventListener('click', () => {
    const current = store.getState().speed;
    const newSpeed = Math.min(3, Math.round((current + 0.1) * 10) / 10);
    store.setState({ speed: newSpeed });
  });

  // Loop toggle
  loopBtn.addEventListener('click', () => {
    const current = store.getState().looping;
    store.setState({ looping: !current });
  });

  // Compare toggle
  compareBtn.addEventListener('click', () => {
    const state = store.getState();
    if (!state.comparisonEnabled) {
      // Default comparison theme to the next theme in list
      const themeIds = [...state.themes.keys()];
      const currentIdx = themeIds.indexOf(state.activeThemeId);
      const nextId = themeIds[(currentIdx + 1) % themeIds.length];
      store.setState({ comparisonEnabled: true, comparisonThemeId: nextId });
    } else {
      store.setState({ comparisonEnabled: false });
    }
  });

  // Store subscriptions
  const unsub = store.subscribe((state, prev) => {
    if (state.activeScenario !== prev.activeScenario) {
      renderTabs();
      loadScenario(state.activeScenario);
    }
    if (state.speed !== prev.speed) {
      speedDisplay.textContent = state.speed.toFixed(1) + 'x';
      engine.setSpeed(state.speed);
    }
    if (state.looping !== prev.looping) {
      engine.setLooping(state.looping);
      renderLoopBtn();
    }
    if (state.comparisonEnabled !== prev.comparisonEnabled) {
      renderCompareBtn();
    }
    if (state.fontSize !== prev.fontSize) {
      renderer.setFontSize(state.fontSize);
    }
    if (state.fontFamily !== prev.fontFamily) {
      renderer.setFontFamily(state.fontFamily);
    }
  });

  return () => {
    engine.destroy();
    renderer.destroy();
    unsub();
  };
}
