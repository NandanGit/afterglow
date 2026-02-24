import { store } from "../store/store.ts";
import { editColor, toggleLock, toggleGlobalLock, togglePin } from "../store/store.ts";
import type {
  ThemeColors,
  ColorSlotId,
  AnsiNormalSlot,
} from "../types/theme.ts";
import { contrastRatio, wcagLevel } from "../color/contrast.ts";
import { copyToClipboard } from "../utils/clipboard.ts";
import { exportTheme, copyCssVars } from "../export/exporter.ts";
import type { ExportFormat } from "../export/exporter.ts";
import {
  createElement as createElementLucide,
  Download,
  ClipboardCopy,
  Link,
  Unlink,
  Lock,
  Unlock,
  Pin,
  PinOff,
} from "lucide";
import type { IconNode } from "lucide";
import { createElement, $ } from "../utils/dom.ts";

const NORMAL_SLOT_KEYS: AnsiNormalSlot[] = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
];

const CORE_SLOTS: { id: ColorSlotId; label: string }[] = [
  { id: "background", label: "Background" },
  { id: "text", label: "Text" },
  { id: "bold", label: "Bold" },
  { id: "selection", label: "Selection" },
  { id: "cursor", label: "Cursor" },
  { id: "cursorText", label: "Cursor Text" },
];

const NORMAL_SLOTS: { id: ColorSlotId; label: string }[] = [
  { id: "black", label: "Black" },
  { id: "red", label: "Red" },
  { id: "green", label: "Green" },
  { id: "yellow", label: "Yellow" },
  { id: "blue", label: "Blue" },
  { id: "magenta", label: "Magenta" },
  { id: "cyan", label: "Cyan" },
  { id: "white", label: "White" },
];

const BRIGHT_SLOTS: { id: ColorSlotId; label: string }[] = [
  { id: "brightBlack", label: "Bright Black" },
  { id: "brightRed", label: "Bright Red" },
  { id: "brightGreen", label: "Bright Green" },
  { id: "brightYellow", label: "Bright Yellow" },
  { id: "brightBlue", label: "Bright Blue" },
  { id: "brightMagenta", label: "Bright Magenta" },
  { id: "brightCyan", label: "Bright Cyan" },
  { id: "brightWhite", label: "Bright White" },
];

function showTooltip(el: HTMLElement, text: string): void {
  const existing = $(".swatch-tooltip", el);
  if (existing) existing.remove();
  const tip = createElement("span", { class: "swatch-tooltip" }, [text]);
  el.appendChild(tip);
  requestAnimationFrame(() => tip.classList.add("swatch-tooltip--visible"));
  setTimeout(() => {
    tip.classList.remove("swatch-tooltip--visible");
    setTimeout(() => tip.remove(), 200);
  }, 1500);
}

function buildCoreTooltip(
  label: string,
  hex: string,
  bgHex: string,
  isBackground: boolean,
): string {
  const upper = hex.toUpperCase();
  if (isBackground) return `${label} · ${upper}`;
  const ratio = contrastRatio(hex, bgHex);
  const level = wcagLevel(ratio);
  return `${label} · ${upper} · ${ratio.toFixed(1)}:1 ${level}`;
}

function createSwatch(
  slotId: ColorSlotId,
  label: string,
  color: string,
  className: string,
  bgHex: string,
  isCore: boolean,
  editable: boolean,
  isPinned: boolean,
): HTMLElement {
  const wrapper = createElement("div", {
    class: `swatch-wrapper ${className}${isPinned ? " swatch-wrapper--pinned" : ""}`,
  });
  const swatch = createElement("div", {
    class: "swatch" + (editable ? " swatch--editable" : ""),
  });
  swatch.style.backgroundColor = color;

  // Hover tooltip
  wrapper.addEventListener("mouseenter", () => {
    const upper = color.toUpperCase();
    let text: string;
    if (isCore) {
      text = buildCoreTooltip(label, color, bgHex, slotId === "background");
    } else {
      text = `${label} · ${upper}`;
    }
    const existing = $(".swatch-tooltip", wrapper);
    if (existing) existing.remove();
    const tip = createElement(
      "span",
      { class: "swatch-tooltip swatch-tooltip--hover" },
      [text],
    );
    wrapper.appendChild(tip);
    requestAnimationFrame(() => tip.classList.add("swatch-tooltip--visible"));
  });

  wrapper.addEventListener("mouseleave", () => {
    const tip = $(".swatch-tooltip--hover", wrapper);
    if (tip) tip.remove();
  });

  if (editable) {
    // In custom mode: click opens native color picker
    const colorInput = createElement("input", {
      type: "color",
      class: "custom-color-input",
      value: color,
    });
    colorInput.addEventListener("input", () => {
      editColor(slotId, colorInput.value);
    });
    swatch.addEventListener("click", () => colorInput.click());
    wrapper.appendChild(colorInput);
  } else {
    // Click to copy
    swatch.addEventListener("click", () => {
      void copyToClipboard(color.toUpperCase()).then(() => {
        showTooltip(wrapper, "Copied!");
      });
    });
  }

  const nameEl = createElement("span", { class: "swatch-label" }, [label]);

  wrapper.appendChild(swatch);
  if (editable) {
    const pinBtn = createElement("button", {
      class: "swatch-pin-btn" + (isPinned ? " swatch-pin-btn--active" : ""),
      title: isPinned ? "Unpin color" : "Pin color",
    });
    const pinIcon = createElementLucide(
      (isPinned ? Pin : PinOff) as IconNode,
      { width: "10", height: "10" },
    ) as unknown as Node;
    pinBtn.appendChild(pinIcon);
    pinBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePin(slotId);
    });
    wrapper.appendChild(pinBtn);
  }
  if (isCore) wrapper.appendChild(nameEl);
  return wrapper;
}

function renderSwatches(container: HTMLElement, colors: ThemeColors): void {
  container.innerHTML = "";
  const bgHex = colors.background;
  const state = store.getState();
  const editable = state.customModeActive;

  // Core colors
  container.appendChild(
    createElement("h3", { class: "section-label" }, ["TERMINAL CORE"]),
  );

  const coreRow = createElement("div", {
    class: "swatch-row swatch-row--core",
  });
  for (const slot of CORE_SLOTS) {
    coreRow.appendChild(
      createSwatch(
        slot.id,
        slot.label,
        colors[slot.id],
        "swatch-core",
        bgHex,
        true,
        editable,
        state.pinnedColors.has(slot.id),
      ),
    );
  }
  container.appendChild(coreRow);

  // Normal colors header (with global lock button in custom mode)
  const normalHeader = createElement("div", {
    // class: editable ? 'section-label-row' : ''
    class: "section-label",
  });
  normalHeader.appendChild(
    createElement("h3", { class: "section-label" }, ["NORMAL COLORS"]),
  );

  container.appendChild(normalHeader);

  const normalRow = createElement("div", {
    class: "swatch-row swatch-row--ansi",
  });
  for (const slot of NORMAL_SLOTS) {
    normalRow.appendChild(
      createSwatch(
        slot.id,
        slot.label,
        colors[slot.id],
        "swatch-ansi",
        bgHex,
        false,
        editable,
        state.pinnedColors.has(slot.id),
      ),
    );
  }
  container.appendChild(normalRow);

  // Per-pair link buttons between normal and bright (custom mode only)
  if (editable) {
    const linkRow = createElement("div", { class: "custom-link-row" });
    for (const ns of NORMAL_SLOT_KEYS) {
      const linkBtn = createElement("button", {
        class:
          "custom-link-btn" +
          (state.locks[ns] ? " custom-link-btn--active" : ""),
        title: state.locks[ns] ? "Unlink pair" : "Link pair",
      });
      const ico = createElementLucide(
        (state.locks[ns] ? Link : Unlink) as IconNode,
        {
          width: "12",
          height: "12",
        },
      ) as unknown as Node;
      linkBtn.appendChild(ico);
      linkBtn.addEventListener("click", () => toggleLock(ns));
      linkRow.appendChild(linkBtn);
    }
    container.appendChild(linkRow);
  }

  // Bright colors
  const brightColorsHeader = createElement(
    "h3",
    { class: "section-label bright-colors-header" },
    ["BRIGHT COLORS"],
  );
  if (editable) {
    const globalLockBtn = createElement(
      "button",
      {
        class: "custom-global-lock-btn",
        title: state.globalLock ? "Unlock all pairs" : "Lock all pairs",
      },
      [
        createElementLucide((state.globalLock ? Lock : Unlock) as IconNode, {
          width: "12",
          height: "12",
        }) as unknown as Node,
        document.createTextNode(state.globalLock ? " Linked" : " Unlinked"),
      ],
    );
    // const lockIcon = createElementLucide(
    //   (state.globalLock ? Lock : Unlock) as IconNode,
    //   { width: "12", height: "12" },
    // ) as unknown as Node;
    // globalLockBtn.appendChild(lockIcon);
    // globalLockBtn.appendChild(
    //   document.createTextNode(state.globalLock ? " Linked" : " Unlinked"),
    // );
    globalLockBtn.addEventListener("click", () => toggleGlobalLock());
    brightColorsHeader.appendChild(globalLockBtn);
  }
  container.appendChild(brightColorsHeader);

  const brightRow = createElement("div", {
    class: "swatch-row swatch-row--ansi",
  });
  for (const slot of BRIGHT_SLOTS) {
    brightRow.appendChild(
      createSwatch(
        slot.id,
        slot.label,
        colors[slot.id],
        "swatch-ansi",
        bgHex,
        false,
        editable,
        state.pinnedColors.has(slot.id),
      ),
    );
  }
  container.appendChild(brightRow);

  // Export buttons for preset themes
  if (!state.customModeActive) {
    container.appendChild(
      createElement("h3", { class: "section-label" }, ["EXPORT"]),
    );

    const exportRow = createElement("div", { class: "custom-export-row" });
    const exportGroup = createElement("div", { class: "custom-export-group" });
    const exportBtn = createElement("button", { class: "custom-export-btn" });
    const dlIcon = createElementLucide(Download as IconNode, {
      width: "14",
      height: "14",
    });
    exportBtn.appendChild(dlIcon as unknown as Node);
    exportBtn.appendChild(document.createTextNode(" Export"));

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
      const item = createElement(
        "button",
        { class: "custom-export-dropdown-item" },
        [label],
      );
      item.addEventListener("click", () => {
        dropdown.style.display = "none";
        const theme = state.themes.get(state.activeThemeId);
        if (theme) exportTheme(theme, format);
      });
      dropdown.appendChild(item);
    }

    exportBtn.addEventListener("click", () => {
      dropdown.style.display =
        dropdown.style.display === "none" ? "flex" : "none";
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
    exportRow.appendChild(exportGroup);

    const copyBtn = createElement("button", { class: "custom-copy-btn" });
    const cpIcon = createElementLucide(ClipboardCopy as IconNode, {
      width: "14",
      height: "14",
    });
    copyBtn.appendChild(cpIcon as unknown as Node);
    copyBtn.appendChild(document.createTextNode(" Copy CSS"));
    copyBtn.addEventListener("click", () => {
      const theme = state.themes.get(state.activeThemeId);
      if (theme) void copyCssVars(theme);
    });
    exportRow.appendChild(copyBtn);

    container.appendChild(exportRow);
  }
}

export function mountColorDisplay(container: HTMLElement): () => void {
  function update(): void {
    const state = store.getState();
    const theme =
      state.customModeActive && state.customTheme
        ? state.customTheme
        : state.themes.get(state.activeThemeId);
    if (!theme) return;
    renderSwatches(container, theme.colors);
  }

  update();
  const unsub = store.subscribe((state, prev) => {
    if (
      state.activeThemeId !== prev.activeThemeId ||
      state.themes !== prev.themes ||
      state.customModeActive !== prev.customModeActive ||
      state.customTheme !== prev.customTheme ||
      state.locks !== prev.locks ||
      state.globalLock !== prev.globalLock ||
      state.pinnedColors !== prev.pinnedColors
    ) {
      update();
    }
  });

  return unsub;
}
