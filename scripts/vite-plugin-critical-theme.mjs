import { getDefaultFocusedTheme } from "../src/data/featured.ts";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";

const MARKER_REGEX = /<style id="critical-theme">[\s\S]*?<\/style>/;

function buildVarDeclarations(theme) {
  return Object.entries(getThemeCssVars(theme))
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");
}

function buildCriticalStyleTag(theme) {
  const decls = buildVarDeclarations(theme);
  const css = `:root[data-theme-id="${theme.id}"],
:root:not([data-theme-id]) {
  ${decls}
  color-scheme: ${theme.type};
}
html { background: ${theme.ui.background}; color: ${theme.ui.foreground}; }`;
  return `<style id="critical-theme">${css}</style>`;
}

export function criticalThemePlugin() {
  return {
    name: "critical-theme",
    transformIndexHtml(html) {
      const theme = getDefaultFocusedTheme().theme;
      const tag = buildCriticalStyleTag(theme);
      if (MARKER_REGEX.test(html)) {
        return html.replace(MARKER_REGEX, tag);
      }
      return html.replace(/<\/head>/, `${tag}\n  </head>`);
    },
  };
}
