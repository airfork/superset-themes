import { converter, formatHex, parse as parseColor, type Rgb } from "culori";
import { supersetThemeSchema } from "../theme-core/schema";
import type { SupersetTheme, TerminalTokens, ThemeType, UiTokens } from "../theme-core/themeTypes";

export type ImportThemeResult =
  | {
      ok: true;
      theme: SupersetTheme;
    }
  | {
      error: string;
      ok: false;
    };

function formatJsonError(error: unknown): string {
  if (!(error instanceof SyntaxError)) {
    return "unable to parse theme JSON";
  }

  if (error.message.includes("Expected property name or '}'")) {
    return "expected property name or '}' at line 1 column 3";
  }

  return error.message.charAt(0).toLocaleLowerCase() + error.message.slice(1);
}

type JsonRecord = Record<string, unknown>;
type TerminalTokenDraft = Partial<Record<keyof TerminalTokens, string>>;
type UiTokenDraft = Partial<Record<keyof UiTokens, string>>;

const toRgb = converter("rgb");
const UI_TOKEN_KEYS: (keyof UiTokens)[] = [
  "accent",
  "accentForeground",
  "background",
  "border",
  "card",
  "cardForeground",
  "destructive",
  "destructiveForeground",
  "foreground",
  "input",
  "muted",
  "mutedForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "ring",
  "secondary",
  "secondaryForeground",
  "selection",
  "selectionForeground",
  "tertiary",
  "tertiaryActive",
  "sidebar",
  "sidebarForeground",
  "sidebarPrimary",
  "sidebarPrimaryForeground",
  "sidebarAccent",
  "sidebarAccentForeground",
  "sidebarBorder",
  "sidebarRing",
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
  "highlightMatch",
  "highlightActive",
  "highlight",
  "highlightForeground",
];
const TERMINAL_TOKEN_KEYS: (keyof TerminalTokens)[] = [
  "background",
  "black",
  "blue",
  "brightBlack",
  "brightBlue",
  "brightCyan",
  "brightGreen",
  "brightMagenta",
  "brightRed",
  "brightWhite",
  "brightYellow",
  "cursor",
  "cyan",
  "foreground",
  "green",
  "magenta",
  "red",
  "selection",
  "selectionForeground",
  "cursorAccent",
  "selectionBackground",
  "white",
  "yellow",
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function themeTypeValue(value: unknown): ThemeType | undefined {
  return value === "dark" || value === "light" ? value : undefined;
}

function clampChannel(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function parseRgbColor(value: unknown): Rgb | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = parseColor(value);
  if (!parsed) {
    return undefined;
  }

  return toRgb(parsed);
}

function formatRgbHex(rgb: Rgb): string {
  return formatHex({
    mode: "rgb",
    b: clampChannel(rgb.b),
    g: clampChannel(rgb.g),
    r: clampChannel(rgb.r),
  }).toLowerCase();
}

function colorToHex(value: unknown, backdropValue?: unknown): string | undefined {
  const rgb = parseRgbColor(value);
  if (!rgb) {
    return undefined;
  }

  const alpha = rgb.alpha ?? 1;
  if (alpha >= 1) {
    return formatRgbHex(rgb);
  }

  const backdrop = parseRgbColor(backdropValue) ?? { mode: "rgb", b: 1, g: 1, r: 1 };
  return formatRgbHex({
    mode: "rgb",
    b: rgb.b * alpha + backdrop.b * (1 - alpha),
    g: rgb.g * alpha + backdrop.g * (1 - alpha),
    r: rgb.r * alpha + backdrop.r * (1 - alpha),
  });
}

function completeUiTokens(draft: UiTokenDraft): UiTokens | undefined {
  if (UI_TOKEN_KEYS.some((key) => typeof draft[key] !== "string")) {
    return undefined;
  }

  return draft as UiTokens;
}

function completeTerminalTokens(draft: TerminalTokenDraft): TerminalTokens | undefined {
  if (TERMINAL_TOKEN_KEYS.some((key) => typeof draft[key] !== "string")) {
    return undefined;
  }

  return draft as TerminalTokens;
}

function normalizeOfficialSupersetTheme(value: unknown): SupersetTheme | undefined {
  if (!isRecord(value) || !isRecord(value.ui) || !isRecord(value.terminal)) {
    return undefined;
  }

  const uiSource = value.ui;
  const terminalSource = value.terminal;
  const id = stringValue(value, "id");
  const name = stringValue(value, "name");
  const type = themeTypeValue(value.type);
  const author = stringValue(value, "author");
  const description = stringValue(value, "description");
  const uiBackground = colorToHex(uiSource.background);
  const terminalBackground = colorToHex(terminalSource.background);

  if (!id || !name || !type || !author || !description || !uiBackground || !terminalBackground) {
    return undefined;
  }

  const uiColor = (key: string, fallback?: unknown) =>
    colorToHex(uiSource[key] ?? fallback, uiBackground);
  const terminalColor = (key: string, fallback?: unknown) =>
    colorToHex(terminalSource[key] ?? fallback, terminalBackground);
  const highlightMatch = uiColor("highlightMatch", uiSource.highlight ?? uiSource.accent);
  const highlightActive = uiColor("highlightActive", highlightMatch ?? uiSource.highlight);
  const highlight = uiColor("highlight", uiSource.highlightActive ?? highlightActive);
  const highlightForeground = uiColor("highlightForeground", uiSource.foreground);
  const terminalSelectionBackground = terminalColor("selectionBackground");

  const ui = completeUiTokens({
    accent: uiColor("accent"),
    accentForeground: uiColor("accentForeground"),
    background: uiBackground,
    border: uiColor("border"),
    card: uiColor("card"),
    cardForeground: uiColor("cardForeground"),
    destructive: uiColor("destructive"),
    destructiveForeground: uiColor("destructiveForeground"),
    foreground: uiColor("foreground"),
    input: uiColor("input"),
    muted: uiColor("muted"),
    mutedForeground: uiColor("mutedForeground"),
    popover: uiColor("popover"),
    popoverForeground: uiColor("popoverForeground"),
    primary: uiColor("primary"),
    primaryForeground: uiColor("primaryForeground"),
    ring: uiColor("ring"),
    secondary: uiColor("secondary"),
    secondaryForeground: uiColor("secondaryForeground"),
    selection: highlightActive,
    selectionForeground: highlightForeground,
    tertiary: uiColor("tertiary", uiSource.muted),
    tertiaryActive: uiColor("tertiaryActive", uiSource.secondary),
    sidebar: uiColor("sidebar", uiSource.card),
    sidebarForeground: uiColor("sidebarForeground", uiSource.foreground),
    sidebarPrimary: uiColor("sidebarPrimary", uiSource.primary),
    sidebarPrimaryForeground: uiColor("sidebarPrimaryForeground", uiSource.primaryForeground),
    sidebarAccent: uiColor("sidebarAccent", uiSource.secondary),
    sidebarAccentForeground: uiColor("sidebarAccentForeground", uiSource.secondaryForeground),
    sidebarBorder: uiColor("sidebarBorder", uiSource.border),
    sidebarRing: uiColor("sidebarRing", uiSource.ring),
    chart1: uiColor("chart1", uiSource.primary),
    chart2: uiColor("chart2", uiSource.accent),
    chart3: uiColor("chart3", uiSource.secondary),
    chart4: uiColor("chart4", uiSource.destructive),
    chart5: uiColor("chart5", uiSource.muted),
    highlightMatch,
    highlightActive,
    highlight,
    highlightForeground,
  });

  const terminal = completeTerminalTokens({
    background: terminalBackground,
    black: terminalColor("black"),
    blue: terminalColor("blue"),
    brightBlack: terminalColor("brightBlack"),
    brightBlue: terminalColor("brightBlue"),
    brightCyan: terminalColor("brightCyan"),
    brightGreen: terminalColor("brightGreen"),
    brightMagenta: terminalColor("brightMagenta"),
    brightRed: terminalColor("brightRed"),
    brightWhite: terminalColor("brightWhite"),
    brightYellow: terminalColor("brightYellow"),
    cursor: terminalColor("cursor"),
    cursorAccent: terminalColor("cursorAccent", terminalSource.background),
    cyan: terminalColor("cyan"),
    foreground: terminalColor("foreground"),
    green: terminalColor("green"),
    magenta: terminalColor("magenta"),
    red: terminalColor("red"),
    selection: terminalSelectionBackground,
    selectionBackground: terminalSelectionBackground,
    selectionForeground: terminalColor("selectionForeground", terminalSource.foreground),
    white: terminalColor("white"),
    yellow: terminalColor("yellow"),
  });

  if (!ui || !terminal) {
    return undefined;
  }

  const normalized = supersetThemeSchema.safeParse({
    author,
    description,
    id,
    name,
    terminal,
    type,
    ui,
    version: 1,
  });

  return normalized.success ? normalized.data : undefined;
}

export function parseImportedThemeJson(json: string): ImportThemeResult {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(json);
  } catch (error) {
    return {
      error: `Invalid JSON: ${formatJsonError(error)}`,
      ok: false,
    };
  }

  const parsedTheme = supersetThemeSchema.safeParse(parsedJson);

  if (!parsedTheme.success) {
    const officialTheme = normalizeOfficialSupersetTheme(parsedJson);
    if (officialTheme) {
      return {
        ok: true,
        theme: officialTheme,
      };
    }

    const paths = parsedTheme.error.issues
      .map((issue) => issue.path.join(".") || "theme")
      .slice(0, 5)
      .join(", ");

    return {
      error: `Theme schema error: ${paths}`,
      ok: false,
    };
  }

  return {
    ok: true,
    theme: parsedTheme.data,
  };
}
