import { store } from '../store/store.ts';
import { createElement, Search, X } from 'lucide';
import type { IconNode } from 'lucide';
import { createElement as h } from '../utils/dom.ts';

export function mountSearch(container: HTMLElement): () => void {
  const wrapper = h('div', { class: 'search-wrapper' });
  const inputWrap = h('div', { class: 'search-input-wrap' });

  const searchIcon = createElement(Search as IconNode, { width: '14', height: '14', class: 'search-icon' });
  inputWrap.appendChild(searchIcon as unknown as Node);

  const input = h('input', {
    type: 'text',
    class: 'search-input',
    placeholder: 'Search themes...',
    id: 'theme-search-input',
  });
  input.addEventListener('input', () => {
    store.setState({ searchQuery: input.value });
    clearBtn.style.display = input.value ? 'flex' : 'none';
  });
  inputWrap.appendChild(input);

  const clearBtn = h('button', { class: 'search-clear-btn', style: 'display:none' });
  clearBtn.appendChild(createElement(X as IconNode, { width: '12', height: '12' }) as unknown as Node);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    store.setState({ searchQuery: '' });
    clearBtn.style.display = 'none';
    input.focus();
  });
  inputWrap.appendChild(clearBtn);

  wrapper.appendChild(inputWrap);
  container.appendChild(wrapper);

  const unsub = store.subscribe((state, prev) => {
    if (state.searchQuery !== prev.searchQuery && input.value !== state.searchQuery) {
      input.value = state.searchQuery;
      clearBtn.style.display = state.searchQuery ? 'flex' : 'none';
    }
  });

  return unsub;
}
