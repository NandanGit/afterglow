import { store } from "../store/store.ts";
import type { Theme } from "../types/theme.ts";
import { createElement as createLucideElement, Star, Heart } from "lucide";
import type { IconNode } from "lucide";
import { createElement, $ } from "../utils/dom.ts";

let favoritesFilterActive = false;

function createStarIcon(filled: boolean): SVGElement {
  const attrs: Record<string, string> = {
    width: "16",
    height: "16",
    class: "star-icon" + (filled ? " star-filled" : ""),
  };
  if (filled) {
    attrs["fill"] = "currentColor";
  }
  return createLucideElement(Star as IconNode, attrs) as unknown as SVGElement;
}

function createColorDots(theme: Theme): HTMLElement {
  const row = createElement("div", { class: "card-dots" });
  const slots = ["red", "green", "yellow", "blue", "magenta", "cyan"] as const;
  for (const slot of slots) {
    const dot = createElement("span", { class: "card-dot" });
    dot.style.backgroundColor = theme.colors[slot];
    row.appendChild(dot);
  }
  return row;
}

function createCard(
  theme: Theme,
  isActive: boolean,
  isFav: boolean,
  isDisabled: boolean,
): HTMLElement {
  const card = createElement("div", {
    class:
      "palette-card" +
      (isActive ? " palette-card--active" : "") +
      (isDisabled ? " palette-card--disabled" : ""),
  });
  card.dataset.themeId = theme.id;

  const accent = theme.colors.selection;
  card.style.background = `linear-gradient(135deg, color-mix(in srgb, ${accent} 10%, #181818) 0%, #181818 70%)`;
  card.style.borderColor = `color-mix(in srgb, ${accent} 35%, #2a2a2a)`;

  const starBtn = createElement("button", {
    class: "card-star-btn",
    type: "button",
    title: isFav ? "Remove from favorites" : "Add to favorites",
  });
  starBtn.appendChild(createStarIcon(isFav));
  starBtn.addEventListener("click", (e) => {
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

  const info = createElement("div", { class: "card-info" });
  info.innerHTML = `
    <span class="card-emoji">${theme.emoji}</span>
    <span class="card-name">${theme.name}</span>
    <span class="card-subtitle">${theme.subtitle}</span>
  `;

  card.appendChild(starBtn);
  card.appendChild(dots);
  card.appendChild(info);

  card.addEventListener("click", () => {
    if (isDisabled) return;
    store.setState({ activeThemeId: theme.id });
  });

  return card;
}

export function mountPaletteStrip(container: HTMLElement): () => void {
  container.innerHTML = `
    <div class="palette-strip-wrapper">
      <div class="palette-strip-header">
        <span class="palette-label">CHOOSE A PALETTE</span>
        <div class="palette-header-right">
          <button class="favorites-filter-btn" id="favorites-filter-btn" title="Show favorites only"></button>
          <div class="palette-tabs">
            <button class="palette-tab palette-tab--active" data-tab="handcrafted">Default</button>
            <button class="palette-tab" data-tab="community">Community</button>
          </div>
        </div>
      </div>
      <div class="palette-scroll" id="palette-scroll"></div>
      <div class="community-empty" id="community-empty" style="display:none;">
        <p class="community-empty-text">No community themes yet. Stay tuned!</p>
      </div>
    </div>
  `;

  const scroll = $("#palette-scroll", container) as HTMLElement;
  const communityEmpty = $("#community-empty", container) as HTMLElement;
  const tabs = container.querySelectorAll<HTMLButtonElement>(".palette-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab as "handcrafted" | "community";
      store.setState({ activeTab: tabName });
      tabs.forEach((t) => t.classList.toggle("palette-tab--active", t === tab));
    });
  });

  const favBtn = $("#favorites-filter-btn", container) as HTMLButtonElement;
  const heartIcon = createLucideElement(Heart as IconNode, {
    width: "14",
    height: "14",
  }) as unknown as Node;
  favBtn.appendChild(heartIcon);
  favBtn.appendChild(document.createTextNode(" Favorites"));
  favBtn.addEventListener("click", () => {
    favoritesFilterActive = !favoritesFilterActive;
    favBtn.classList.toggle(
      "favorites-filter-btn--active",
      favoritesFilterActive,
    );
    render();
  });

  function render(): void {
    const {
      themes,
      activeThemeId,
      favorites,
      activeTab,
      searchQuery,
      customModeActive,
    } = store.getState();
    if (activeTab === "community") {
      scroll.style.display = "none";
      communityEmpty.style.display = "flex";
      return;
    }
    scroll.style.display = "flex";
    communityEmpty.style.display = "none";
    scroll.innerHTML = "";

    const query = searchQuery.toLowerCase();

    for (const [, theme] of themes) {
      if (theme.source !== "bundled") continue;

      // Search filter
      if (
        query &&
        !theme.name.toLowerCase().includes(query) &&
        !theme.subtitle.toLowerCase().includes(query)
      )
        continue;

      // Favorites filter
      if (favoritesFilterActive && !favorites.has(theme.id)) continue;

      const card = createCard(
        theme,
        !customModeActive && theme.id === activeThemeId,
        favorites.has(theme.id),
        customModeActive,
      );
      scroll.appendChild(card);
    }

    // Show empty state for favorites filter
    if (favoritesFilterActive && scroll.children.length === 0) {
      const empty = createElement(
        "div",
        { class: "community-empty", style: "width:100%" },
        [
          createElement("p", { class: "community-empty-text" }, [
            "No favorites yet — click ★ on any theme",
          ]),
        ],
      );
      scroll.appendChild(empty);
    }
  }

  render();
  const unsub = store.subscribe((state, prev) => {
    if (
      state.activeThemeId !== prev.activeThemeId ||
      state.favorites !== prev.favorites ||
      state.themes !== prev.themes ||
      state.activeTab !== prev.activeTab ||
      state.searchQuery !== prev.searchQuery ||
      state.customModeActive !== prev.customModeActive
    ) {
      render();
    }
  });

  return unsub;
}
