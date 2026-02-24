import { store } from "../store/store.ts";
import {
  enterCustomMode,
  exitCustomMode,
  setCustomControl,
  setCustomThemeName,
  regeneratePalette,
  toggleControlLock,
} from "../store/store.ts";
import type { CustomControls } from "../store/store.ts";
import {
  createElement as createLucideElement,
  Dices,
  X,
  Download,
  ChevronDown,
  ClipboardCopy,
  Share2,
  Lock,
  Unlock,
} from "lucide";
import type { IconNode } from "lucide";
import { exportTheme, copyCssVars } from "../export/exporter.ts";
import type { ExportFormat } from "../export/exporter.ts";
import { encodeThemeToURL } from "../sharing/url.ts";
import { copyToClipboard } from "../utils/clipboard.ts";
import { createElement } from "../utils/dom.ts";

function icon(node: IconNode, size = 16, cls = ""): Node {
  return createLucideElement(node, {
    width: String(size),
    height: String(size),
    ...(cls ? { class: cls } : {}),
  }) as unknown as Node;
}

const SLIDER_DEFS: {
  key: keyof CustomControls;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "brightness", label: "Brightness", min: 0, max: 1, step: 0.1 },
  { key: "hue", label: "Hue", min: 0, max: 360, step: 1 },
  { key: "warmth", label: "Warmth", min: -1, max: 1, step: 0.05 },
  { key: "saturation", label: "Saturation", min: 0, max: 1, step: 0.01 },
  { key: "contrast", label: "Contrast", min: 0, max: 1, step: 0.01 },
];

export function mountCustomBuilder(container: HTMLElement): () => void {
  function render(): void {
    const state = store.getState();
    container.innerHTML = "";

    if (!state.customModeActive) {
      renderInactiveState(container);
    } else {
      renderActiveState(container);
    }
  }

  function renderInactiveState(el: HTMLElement): void {
    const wrapper = createElement("div", { class: "custom-builder-inactive" }, [
      createElement("h3", { class: "section-label" }, ["CREATE CUSTOM THEME"]),
    ]);

    const btn = createElement("button", { class: "custom-start-btn" }, [
      "Start Building",
    ]);
    btn.addEventListener("click", () => enterCustomMode());
    wrapper.appendChild(btn);

    el.appendChild(wrapper);
  }

  function renderActiveState(el: HTMLElement): void {
    const state = store.getState();
    if (!state.customTheme) return;

    const wrapper = createElement("div", { class: "custom-builder-active" });

    // Header
    const header = createElement("div", { class: "custom-builder-header" });
    const headerLabel = createElement(
      "h3",
      { class: "section-label", style: "margin-top:0" },
      ["CUSTOM BUILDER"],
    );
    const discardBtn = createElement("button", {
      class: "custom-discard-btn",
      title: "Discard",
    });
    discardBtn.appendChild(icon(X as IconNode, 16));
    discardBtn.addEventListener("click", () => exitCustomMode());
    header.appendChild(headerLabel);
    header.appendChild(discardBtn);
    wrapper.appendChild(header);

    // Theme name + export/copy row
    const nameRow = createElement("div", { class: "custom-name-row" });
    const nameInput = createElement("input", {
      type: "text",
      class: "custom-name-input",
      value: state.customTheme.name,
      placeholder: "Theme name",
    });
    nameInput.addEventListener("input", () =>
      setCustomThemeName(nameInput.value),
    );
    nameRow.appendChild(nameInput);

    // Export split-button
    const exportGroup = createElement("div", { class: "custom-export-group" });
    const exportBtn = createElement("button", { class: "custom-export-btn" });
    exportBtn.appendChild(icon(Download as IconNode, 14));
    exportBtn.appendChild(document.createTextNode(" Export"));
    const chevron = createElement("span", { class: "custom-export-chevron" });
    chevron.appendChild(icon(ChevronDown as IconNode, 12));
    exportBtn.appendChild(chevron);

    const dropdown = createElement("div", {
      class: "custom-export-dropdown",
      style: "display:none",
    });
    const formats: { label: string; format: ExportFormat }[] = [
      { label: ".terminal (macOS)", format: "terminal" },
      { label: ".json (Raw JSON)", format: "json" },
      { label: ".css (CSS Variables)", format: "css" },
    ];
    for (const { label, format } of formats) {
      const item = createElement("button", { class: "custom-export-dropdown-item" }, [label]);
      item.addEventListener("click", () => {
        dropdown.style.display = "none";
        const current = store.getState();
        if (current.customTheme) exportTheme(current.customTheme, format);
      });
      dropdown.appendChild(item);
    }
    exportBtn.addEventListener("click", () => {
      dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
    });
    const closeDropdown = (e: MouseEvent) => {
      if (!exportGroup.contains(e.target as Node)) {
        dropdown.style.display = "none";
        document.removeEventListener("click", closeDropdown);
      }
    };
    exportBtn.addEventListener("click", () => {
      setTimeout(() => document.addEventListener("click", closeDropdown), 0);
    });
    exportGroup.appendChild(exportBtn);
    exportGroup.appendChild(dropdown);
    nameRow.appendChild(exportGroup);

    const copyBtn = createElement("button", { class: "custom-copy-btn" });
    copyBtn.appendChild(icon(ClipboardCopy as IconNode, 14));
    copyBtn.appendChild(document.createTextNode(" CSS"));
    copyBtn.addEventListener("click", () => {
      const current = store.getState();
      if (current.customTheme) void copyCssVars(current.customTheme);
    });
    nameRow.appendChild(copyBtn);
    wrapper.appendChild(nameRow);

    // Sliders
    const slidersDiv = createElement("div", { class: "custom-sliders" });
    for (const def of SLIDER_DEFS) {
      const isLocked = state.lockedControls.has(def.key);
      const row = createElement("div", { class: "custom-slider-row" });

      // Lock button (absolute-positioned to the left)
      const lockBtn = createElement("button", {
        class: "custom-control-lock-btn" + (isLocked ? " custom-control-lock-btn--active" : ""),
        title: isLocked ? "Unlock (Surprise Me will randomize this)" : "Lock (Surprise Me will keep this)",
      });
      lockBtn.appendChild(icon((isLocked ? Lock : Unlock) as IconNode, 11));
      lockBtn.addEventListener("click", () => toggleControlLock(def.key));
      row.appendChild(lockBtn);

      row.appendChild(
        createElement("label", { class: "custom-slider-label" }, [def.label]),
      );
      const isBrightness = def.key === "brightness";
      const isHue = def.key === "hue";
      const input = createElement("input", {
        type: "range",
        class:
          "custom-slider" +
          (isHue ? " custom-slider--hue" : "") +
          (isBrightness ? " custom-slider--brightness" : ""),
        min: String(def.min),
        max: String(def.max),
        step: String(def.step),
        value: String(state.customControls[def.key]),
      });
      input.addEventListener("input", () => {
        setCustomControl(def.key, parseFloat(input.value));
      });
      if (isBrightness) {
        row.appendChild(
          createElement("span", { class: "custom-slider-hint dark-hint" }, [
            "Dark",
          ]),
        );
      }
      row.appendChild(input);
      if (isBrightness) {
        row.appendChild(
          createElement("span", { class: "custom-slider-hint light-hint" }, [
            "Light",
          ]),
        );
      }

      slidersDiv.appendChild(row);
    }
    wrapper.appendChild(slidersDiv);

    // Surprise Me button
    const surpriseBtn = createElement("button", {
      class: "custom-surprise-btn",
    });
    surpriseBtn.appendChild(icon(Dices as IconNode, 16));
    surpriseBtn.appendChild(document.createTextNode(" Surprise Me"));
    surpriseBtn.addEventListener("click", () => {
      const current = store.getState();
      const locked = current.lockedControls;

      // Brightness: avoid mid-range 0.3–0.7 — pick dark (<0.3) or light (>0.7)
      let newBrightness = current.customControls.brightness;
      if (!locked.has("brightness")) {
        newBrightness = Math.random() < 0.5
          ? Math.random() * 0.3          // dark: 0–0.3
          : 0.7 + Math.random() * 0.3;   // light: 0.7–1.0
      }

      const controls: CustomControls = {
        hue: locked.has("hue") ? current.customControls.hue : Math.random() * 360,
        warmth: locked.has("warmth") ? current.customControls.warmth : Math.random() * 2 - 1,
        saturation: locked.has("saturation") ? current.customControls.saturation : 0.4 + Math.random() * 0.45,
        contrast: locked.has("contrast") ? current.customControls.contrast : 0.45 + Math.random() * 0.45,
        brightness: newBrightness,
      };
      store.setState({ customControls: controls });
      regeneratePalette(controls);
      render();
    });
    wrapper.appendChild(surpriseBtn);

    // Share button
    const shareBtn = createElement("button", { class: "custom-surprise-btn" });
    shareBtn.appendChild(icon(Share2 as IconNode, 14));
    shareBtn.appendChild(document.createTextNode(" Share Link"));
    shareBtn.addEventListener("click", () => {
      const current = store.getState();
      if (!current.customTheme) return;
      const encoded = encodeThemeToURL(
        current.customTheme,
        current.customControls,
      );
      const url = `${window.location.origin}${window.location.pathname}?theme=${encoded}`;
      history.replaceState(null, "", `?theme=${encoded}`);
      void copyToClipboard(url).then((ok) => {
        if (ok) {
          shareBtn.textContent = "✓ Link copied!";
          setTimeout(() => {
            shareBtn.innerHTML = "";
            shareBtn.appendChild(icon(Share2 as IconNode, 14));
            shareBtn.appendChild(document.createTextNode(" Share Link"));
          }, 2000);
        }
      });
    });
    wrapper.appendChild(shareBtn);

    el.appendChild(wrapper);
  }

  render();

  const unsub = store.subscribe((state, prev) => {
    if (
      state.customModeActive !== prev.customModeActive ||
      state.lockedControls !== prev.lockedControls
    ) {
      render();
    }
  });

  return unsub;
}
