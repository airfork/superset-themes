import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FEATURED_DEFAULT_ID = "tokyo-night";
const MARKER_REGEX = /<style id="critical-theme">[\s\S]*?<\/style>/;

function readDefaultTheme(root) {
  const path = resolve(root, `src/data/themes/${FEATURED_DEFAULT_ID}.json`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function kebab(str) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function buildVarDeclarations(theme) {
  const decls = [];
  for (const [key, value] of Object.entries(theme.ui)) {
    decls.push(`--preview-ui-${kebab(key)}: ${value};`);
  }
  for (const [key, value] of Object.entries(theme.terminal)) {
    decls.push(`--preview-terminal-${kebab(key)}: ${value};`);
  }
  return decls.join("\n  ");
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
  let root = process.cwd();
  return {
    name: "critical-theme",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml(html) {
      const theme = readDefaultTheme(root);
      const tag = buildCriticalStyleTag(theme);
      if (MARKER_REGEX.test(html)) {
        return html.replace(MARKER_REGEX, tag);
      }
      return html.replace(/<\/head>/, `${tag}\n  </head>`);
    },
  };
}
