import { getFeaturedThemes } from "../data/featured";

export interface FeaturedByMode {
  light: string[];
  dark: string[];
}

// Featured ids grouped by mode, preserving featured order. Build-time and the
// inline first-paint script both read this so the catalog stays the source of truth.
export function getFeaturedIdsByMode(): FeaturedByMode {
  const byMode: FeaturedByMode = { light: [], dark: [] };
  for (const entry of getFeaturedThemes()) {
    byMode[entry.theme.type].push(entry.theme.id);
  }
  return byMode;
}

// Pure: choose a featured id for the OS color scheme. `random` is a [0,1) value.
// An empty preferred pool falls back to the other mode, then to fallbackId.
export function pickThemeIdForScheme(
  prefersDark: boolean,
  byMode: FeaturedByMode,
  random: number,
  fallbackId: string,
): string {
  const preferred = prefersDark ? byMode.dark : byMode.light;
  const alternate = prefersDark ? byMode.light : byMode.dark;
  const pool = preferred.length > 0 ? preferred : alternate;
  if (pool.length === 0) {
    return fallbackId;
  }
  const index = Math.min(pool.length - 1, Math.floor(random * pool.length));
  return pool[index] ?? fallbackId;
}
