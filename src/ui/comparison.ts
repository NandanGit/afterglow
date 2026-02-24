import { store } from "../store/store.ts";
import type { Theme } from "../types/theme.ts";
import { SimulatorEngine } from "../simulator/engine.ts";
import { TerminalRenderer } from "../simulator/renderer.ts";
import { scenarios } from "../simulator/scenarios/index.ts";
import { createElement, $ } from "../utils/dom.ts";

export function mountComparison(previewPanel: HTMLElement): () => void {
  let rendererB: TerminalRenderer | null = null;
  let engineB: SimulatorEngine | null = null;
  let wrapperEl: HTMLElement | null = null;
  let overlayEl: HTMLElement | null = null;
  let sliderEl: HTMLElement | null = null;
  let selectorEl: HTMLElement | null = null;
  let originalTerminal: HTMLElement | null = null;
  let isDragging = false;
  let removeDocListeners: (() => void) | null = null;

  function applyThemeVarsToEl(el: HTMLElement, theme: Theme): void {
    for (const [key, value] of Object.entries(theme.colors)) {
      const cssVar = `--theme-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
      el.style.setProperty(cssVar, value);
    }
  }

  function rebuildSelector(): void {
    if (!selectorEl) return;
    const select = selectorEl.querySelector("select") as HTMLSelectElement;
    if (!select) return;
    const state = store.getState();
    select.innerHTML = "";
    for (const [id, theme] of state.themes) {
      if (id === state.activeThemeId) continue;
      const opt = createElement("option", { value: id }, [theme.name]);
      if (id === state.comparisonThemeId) opt.selected = true;
      select.appendChild(opt);
    }
  }

  function render(): void {
    cleanup();
    const state = store.getState();
    if (!state.comparisonEnabled) return;

    // Find the existing terminal window
    originalTerminal = $(".terminal-window", previewPanel) as HTMLElement;
    if (!originalTerminal) return;
    const parent = originalTerminal.parentElement!;

    // Wrap terminal window in a comparison wrapper
    wrapperEl = createElement("div", { class: "comparison-wrapper" });
    parent.insertBefore(wrapperEl, originalTerminal);
    wrapperEl.appendChild(originalTerminal);

    // Create overlay terminal window
    overlayEl = createElement("div", {
      class: "terminal-window comparison-overlay",
    });

    const titlebar = createElement("div", { class: "terminal-titlebar" });
    const dots = createElement("div", {
      class: "terminal-dots",
      innerHTML:
        '<span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>',
    });
    // dots.innerHTML =
    //   '<span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>';
    titlebar.appendChild(dots);
    const title = createElement("span", { class: "terminal-title" }, [
      $(".terminal-title", originalTerminal)?.textContent || "Comparison",
    ]);
    titlebar.appendChild(title);
    overlayEl.appendChild(titlebar);

    const contentEl = createElement("div", { class: "terminal-content" });
    overlayEl.appendChild(contentEl);

    // Apply comparison theme CSS vars to overlay
    const compTheme = state.comparisonThemeId
      ? state.themes.get(state.comparisonThemeId)
      : null;
    if (compTheme) applyThemeVarsToEl(overlayEl, compTheme);

    wrapperEl.appendChild(overlayEl);

    // Create slider
    sliderEl = createElement("div", { class: "comparison-slider" });
    wrapperEl.appendChild(sliderEl);

    // Set initial clip position
    const updateClip = (pct: number) => {
      overlayEl!.style.clipPath = `inset(0 0 0 ${pct}%)`;
      sliderEl!.style.left = `${pct}%`;
    };
    updateClip(state.sliderPosition);

    // Drag handling
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      sliderEl!.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const rect = wrapperEl!.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
      );
      updateClip(pct);
      store.setState({ sliderPosition: pct });
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    sliderEl.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    removeDocListeners = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    // Add comparison selector to speed controls
    const controlsArea = $(".speed-controls", previewPanel);
    if (controlsArea) {
      selectorEl = createElement("div", { class: "comparison-selector" });
      const select = createElement("select", { class: "comparison-select" });
      for (const [id, theme] of state.themes) {
        if (id === state.activeThemeId) continue;
        const opt = createElement("option", { value: id }, [theme.name]);
        if (id === state.comparisonThemeId) opt.selected = true;
        select.appendChild(opt);
      }
      select.addEventListener("change", () => {
        store.setState({ comparisonThemeId: select.value });
      });
      selectorEl.appendChild(select);
      controlsArea.appendChild(selectorEl);
    }

    // Set up renderer and engine for overlay
    rendererB = new TerminalRenderer(contentEl);
    rendererB.setFontSize(state.fontSize);
    rendererB.setFontFamily(state.fontFamily);

    engineB = new SimulatorEngine({
      onPrompt: (prompt) => rendererB?.showPrompt(prompt),
      onTypeChar: (char) => rendererB?.typeChar(char),
      onOutputLine: (event) => rendererB?.outputLine(event),
      onComplete: () => rendererB?.showIdleCursor(),
      onClear: () => rendererB?.clear(),
      onFinishCommand: () => rendererB?.finishCommand(),
    });

    const scenario = scenarios[state.activeScenario];
    engineB.load(scenario);
    engineB.setSpeed(state.speed);
    engineB.setLooping(state.looping);
    engineB.play();
  }

  function cleanup(): void {
    if (removeDocListeners) {
      removeDocListeners();
      removeDocListeners = null;
    }
    if (engineB) {
      engineB.destroy();
      engineB = null;
    }
    if (rendererB) {
      rendererB.destroy();
      rendererB = null;
    }

    // Remove selector from controls
    if (selectorEl) {
      selectorEl.remove();
      selectorEl = null;
    }

    // Unwrap terminal window back to its original parent
    if (wrapperEl && originalTerminal && wrapperEl.parentElement) {
      wrapperEl.parentElement.insertBefore(originalTerminal, wrapperEl);
      wrapperEl.remove();
    }

    wrapperEl = null;
    overlayEl = null;
    sliderEl = null;
    originalTerminal = null;
    isDragging = false;
  }

  render();

  const unsub = store.subscribe((state, prev) => {
    // Toggle comparison on/off: full setup/teardown
    if (state.comparisonEnabled !== prev.comparisonEnabled) {
      cleanup();
      render();
      return;
    }

    if (!state.comparisonEnabled) return;

    // Comparison theme changed: re-apply CSS vars
    if (state.comparisonThemeId !== prev.comparisonThemeId && overlayEl) {
      const compTheme = state.comparisonThemeId
        ? state.themes.get(state.comparisonThemeId)
        : null;
      if (compTheme) applyThemeVarsToEl(overlayEl, compTheme);
    }

    // Active theme or custom mode changed: rebuild selector options
    if (
      state.activeThemeId !== prev.activeThemeId ||
      state.customModeActive !== prev.customModeActive
    ) {
      rebuildSelector();
    }

    // Scenario changed: reload overlay engine
    if (state.activeScenario !== prev.activeScenario && engineB && rendererB) {
      rendererB.clear();
      const scenario = scenarios[state.activeScenario];
      engineB.load(scenario);
      engineB.setSpeed(state.speed);
      engineB.setLooping(state.looping);
      engineB.play();
    }

    // Engine settings
    if (state.speed !== prev.speed && engineB) engineB.setSpeed(state.speed);
    if (state.looping !== prev.looping && engineB)
      engineB.setLooping(state.looping);

    // Font settings
    if (state.fontSize !== prev.fontSize && rendererB)
      rendererB.setFontSize(state.fontSize);
    if (state.fontFamily !== prev.fontFamily && rendererB)
      rendererB.setFontFamily(state.fontFamily);
  });

  return () => {
    cleanup();
    unsub();
  };
}
