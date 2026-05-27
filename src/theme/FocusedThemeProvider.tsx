import type { ReactNode } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { catalogThemes } from "../data/catalog";
import { getDefaultFocusedTheme } from "../data/featured";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { applyTheme } from "./applyTheme";

export interface FocusedThemeContextValue {
  focused: CatalogThemeEntry;
  setFocusedId: (id: string) => void;
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

  const focused = useMemo<CatalogThemeEntry>(() => {
    const entry = catalogThemes.find((candidate) => candidate.theme.id === focusedId);
    return entry ?? getDefaultFocusedTheme();
  }, [focusedId]);

  useEffect(() => {
    applyTheme(focused.theme);
  }, [focused]);

  const value = useMemo<FocusedThemeContextValue>(() => ({ focused, setFocusedId }), [focused]);

  return <FocusedThemeContext.Provider value={value}>{children}</FocusedThemeContext.Provider>;
}
