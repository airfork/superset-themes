import type { ReactNode } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { catalogThemes } from "../data/catalog";
import { getDefaultFocusedTheme } from "../data/featured";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { applyTheme } from "./applyTheme";

export interface FocusedThemeContextValue {
  focused: CatalogThemeEntry;
  setFocusedId: (id: string) => void;
  // Lab pushes its live draft here so the whole chrome morphs as tokens change.
  // A transient entry overrides the catalog focus until cleared (on route exit).
  setTransientEntry: (entry: CatalogThemeEntry | null) => void;
}

export const FocusedThemeContext = createContext<FocusedThemeContextValue | null>(null);

interface FocusedThemeProviderProps {
  children: ReactNode;
  initialThemeId?: string;
}

export function FocusedThemeProvider({ children, initialThemeId }: FocusedThemeProviderProps) {
  const [focusedId, setFocusedId] = useState<string>(
    () => initialThemeId ?? getDefaultFocusedTheme().theme.id,
  );
  const [transientEntry, setTransientEntry] = useState<CatalogThemeEntry | null>(null);

  const focused = useMemo<CatalogThemeEntry>(() => {
    if (transientEntry) {
      return transientEntry;
    }
    const entry = catalogThemes.find((candidate) => candidate.theme.id === focusedId);
    return entry ?? getDefaultFocusedTheme();
  }, [focusedId, transientEntry]);

  useEffect(() => {
    applyTheme(focused.theme);
  }, [focused]);

  const value = useMemo<FocusedThemeContextValue>(
    () => ({ focused, setFocusedId, setTransientEntry }),
    [focused],
  );

  return <FocusedThemeContext.Provider value={value}>{children}</FocusedThemeContext.Provider>;
}
