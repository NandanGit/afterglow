import type { Theme } from '../types/theme.ts';

const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/NandanGit/afterglow@main/themes';
const CACHE_KEY = 'afterglow-registry';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface RegistryEntry {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
}

export interface Registry {
  version: number;
  bundledThemes: RegistryEntry[];
  communityThemes: RegistryEntry[];
}

interface CachedRegistry {
  data: Registry;
  timestamp: number;
}

export async function fetchRegistry(): Promise<Registry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CachedRegistry = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    }
  } catch { /* ignore corrupted cache */ }

  const res = await fetch(`${JSDELIVR_BASE}/registry.json`);
  if (!res.ok) throw new Error(`Failed to fetch registry: ${res.status}`);

  const data: Registry = await res.json();

  try {
    const cached: CachedRegistry = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch { /* storage full — ignore */ }

  return data;
}

export async function fetchCommunityTheme(id: string): Promise<Theme> {
  const res = await fetch(`${JSDELIVR_BASE}/community/${id}.json`);
  if (!res.ok) throw new Error(`Failed to fetch theme ${id}: ${res.status}`);

  const json = await res.json();
  return { ...json, source: 'community' as const };
}
