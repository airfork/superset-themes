import { getThemeCssVars } from "../preview/themeCssVars";
import type { SupersetTheme } from "../theme-core/themeTypes";

export function applyTheme(theme: SupersetTheme, root?: HTMLElement): void {
  const target = root ?? (typeof document !== "undefined" ? document.documentElement : undefined);
  if (!target) {
    return;
  }
  const vars = getThemeCssVars(theme);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
  target.setAttribute("data-theme-type", theme.type);
  target.setAttribute("data-theme-id", theme.id);
}
