import { store } from '../store/store.ts';
import { createElement, Search, X } from 'lucide';
import type { IconNode } from 'lucide';

export function mountSearch(container: HTMLElement): () => void {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-wrapper';

  const inputWrap = document.createElement('div');
  inputWrap.className = 'search-input-wrap';

  const searchIcon = createElement(Search as IconNode, { width: '14', height: '14', class: 'search-icon' });
  inputWrap.appendChild(searchIcon as unknown as Node);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = 'Search themes...';
  input.id = 'theme-search-input';
  input.addEventListener('input', () => {
    store.setState({ searchQuery: input.value });
    clearBtn.style.display = input.value ? 'flex' : 'none';
  });
  inputWrap.appendChild(input);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'search-clear-btn';
  clearBtn.style.display = 'none';
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
