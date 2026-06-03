import { getDefaultFocusedTheme, getFeaturedThemes } from "../src/data/featured.ts";
import { getFeaturedIdsByMode } from "../src/theme/defaultThemeSelection.ts";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";

const MARKER_REGEX = /<style id="critical-theme">[\s\S]*?<\/style>/;

function buildVarDeclarations(theme) {
  return Object.entries(getThemeCssVars(theme))
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");
}

function buildThemeBlock(theme, rootSelector, htmlSelector) {
  return `${rootSelector} {
  ${buildVarDeclarations(theme)}
  color-scheme: ${theme.type};
}
${htmlSelector} { background: ${theme.ui.background}; color: ${theme.ui.foreground}; }`;
}

// One critical block per featured theme keyed by data-theme-id (so the first-paint
// script can land on any of them flash-free), plus a no-attribute fallback for the
// JS-disabled / explicit-deep-link path that paints via the runtime default.
function buildCriticalCss() {
  const blocks = getFeaturedThemes().map(({ theme }) =>
    buildThemeBlock(
      theme,
      `:root[data-theme-id="${theme.id}"]`,
      `html[data-theme-id="${theme.id}"]`,
    ),
  );
  const fallback = getDefaultFocusedTheme().theme;
  blocks.push(buildThemeBlock(fallback, ":root:not([data-theme-id])", "html:not([data-theme-id])"));
  return blocks.join("\n");
}

// Runs before first paint. Only acts on a bare visit (no ?theme=), so deep links and
// compare/lab params keep painting via the :not([data-theme-id]) fallback. Picks a
// random featured theme within the OS color scheme and sets data-theme-id, which the
// matching baked block paints with no flash.
function buildInlineScript() {
  const byMode = JSON.stringify(getFeaturedIdsByMode());
  const fallbackId = JSON.stringify(getDefaultFocusedTheme().theme.id);
  return (
    "<script>(function(){try{" +
    "if(new URLSearchParams(location.search).get('theme'))return;" +
    `var m=${byMode},fb=${fallbackId};` +
    "var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;" +
    "var pool=(dark?m.dark:m.light);if(!pool.length)pool=(dark?m.light:m.dark);" +
    "var id=pool.length?(pool[Math.floor(Math.random()*pool.length)]||fb):fb;" +
    "document.documentElement.setAttribute('data-theme-id',id);" +
    "}catch(e){}})();</script>"
  );
}

export function criticalThemePlugin() {
  return {
    name: "critical-theme",
    transformIndexHtml(html) {
      const tag = `<style id="critical-theme">${buildCriticalCss()}</style>\n  ${buildInlineScript()}`;
      if (MARKER_REGEX.test(html)) {
        return html.replace(MARKER_REGEX, tag);
      }
      return html.replace(/<\/head>/, `${tag}\n  </head>`);
    },
  };
}
