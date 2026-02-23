export function getWithTTL<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp: number; data: T };
    const TTL = 60 * 60 * 1000; // 1 hour
    if (Date.now() - parsed.timestamp > TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function setWithTTL<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data: value }));
  } catch { /* storage full */ }
}
