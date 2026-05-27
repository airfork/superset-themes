import { useContext } from "react";
import type { FocusedThemeContextValue } from "./FocusedThemeProvider";
import { FocusedThemeContext } from "./FocusedThemeProvider";

export function useFocusedTheme(): FocusedThemeContextValue {
  const ctx = useContext(FocusedThemeContext);
  if (!ctx) {
    throw new Error("useFocusedTheme must be used inside FocusedThemeProvider");
  }
  return ctx;
}
