import { getDefaultFocusedTheme, getFeaturedThemes } from "../src/data/featured.ts";
import { getThemeCssVars } from "../src/preview/themeCssVars.ts";
import { getFeaturedIdsByMode } from "../src/theme/defaultThemeSelection.ts";

const MARKER_REGEX = /<style id="critical-theme">[\s\S]*?<\/style>/;

function normalizeAppBasepath(base) {
  const source = String(base || "/").trim();
  if (!source || source === "." || source === "./") {
    return "/";
  }

  let pathname = source;
  if (/^[a-z]+:\/\//i.test(source)) {
    pathname = new URL(source).pathname;
  }

  const pathOnly = pathname.split(/[?#]/)[0] || "/";
  const collapsed = pathOnly.replace(/\/+/g, "/");
  const withLeadingSlash = collapsed.startsWith("/") ? collapsed : `/${collapsed}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/g, "") : withLeadingSlash;
  return withoutTrailingSlash || "/";
}

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

// Runs before first paint. Only acts on a bare catalog visit (no ?theme=), so route
// deep links keep painting via the :not([data-theme-id]) fallback. Picks a random
// featured theme within the OS color scheme and sets data-theme-id, which the matching
// baked block paints with no flash.
function buildInlineScript(appBasepath) {
  const byMode = JSON.stringify(getFeaturedIdsByMode());
  const fallbackId = JSON.stringify(getDefaultFocusedTheme().theme.id);
  const basepath = JSON.stringify(appBasepath);
  return (
    "<script>(function(){try{" +
    `var base=${basepath};` +
    "var path=(location.pathname||'/').replace(/\\/+$/,'')||'/';" +
    "if(base==='/'?path!=='/':path!==base)return;" +
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
  let appBasepath = "/";
  return {
    name: "critical-theme",
    configResolved(config) {
      appBasepath = normalizeAppBasepath(config.base);
    },
    transformIndexHtml(html) {
      const tag = `<style id="critical-theme">${buildCriticalCss()}</style>\n  ${buildInlineScript(
        appBasepath,
      )}`;
      if (MARKER_REGEX.test(html)) {
        return html.replace(MARKER_REGEX, tag);
      }
      return html.replace(/<\/head>/, `${tag}\n  </head>`);
    },
  };
}
