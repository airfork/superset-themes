import type { SupersetTheme } from "./themeTypes";

export type ContrastSeverity = "error" | "warning";

type ColorTokenPath =
  | "ui.background"
  | "ui.foreground"
  | "ui.card"
  | "ui.cardForeground"
  | "ui.primary"
  | "ui.primaryForeground"
  | "ui.destructive"
  | "ui.destructiveForeground"
  | "ui.selection"
  | "ui.selectionForeground"
  | "terminal.background"
  | "terminal.foreground"
  | "terminal.selection"
  | "terminal.selectionForeground";

export type ContrastPair = {
  backgroundPath: ColorTokenPath;
  foregroundPath: ColorTokenPath;
  label: string;
  required: boolean;
  threshold: number;
};

export type ContrastWarning = ContrastPair & {
  ratio: number;
  severity: ContrastSeverity;
};

export type ThemeContrastResult = {
  checkedPairs: ContrastPair[];
  warnings: ContrastWarning[];
};

const WCAG_NORMAL_TEXT_THRESHOLD = 4.5;

const CONTRAST_PAIRS = [
  {
    backgroundPath: "ui.background",
    foregroundPath: "ui.foreground",
    label: "UI foreground on background",
    required: true,
    threshold: WCAG_NORMAL_TEXT_THRESHOLD,
  },
  {
    backgroundPath: "ui.card",
    foregroundPath: "ui.cardForeground",
    label: "UI card foreground on card",
    required: true,
    threshold: WCAG_NORMAL_TEXT_THRESHOLD,
  },
  {
    backgroundPath: "ui.primary",
    foregroundPath: "ui.primaryForeground",
    label: "UI primary foreground on primary",
    required: true,
    threshold: WCAG_NORMAL_TEXT_THRESHOLD,
  },
  {
    backgroundPath: "ui.destructive",
    foregroundPath: "ui.destructiveForeground",
    label: "UI destructive foreground on destructive",
    required: true,
    threshold: WCAG_NORMAL_TEXT_THRESHOLD,
  },
  {
    backgroundPath: "terminal.background",
    foregroundPath: "terminal.foreground",
    label: "Terminal foreground on background",
    required: true,
    threshold: WCAG_NORMAL_TEXT_THRESHOLD,
  },
  {
    backgroundPath: "ui.selection",
    foregroundPath: "ui.selectionForeground",
    label: "UI selection foreground on selection",
    required: false,
    threshold: WCAG_NORMAL_TEXT_THRESHOLD,
  },
  {
    backgroundPath: "terminal.selection",
    foregroundPath: "terminal.selectionForeground",
    label: "Terminal selection foreground on selection",
    required: false,
    threshold: WCAG_NORMAL_TEXT_THRESHOLD,
  },
] as const satisfies readonly ContrastPair[];

export function getContrastPairs(): ContrastPair[] {
  return [...CONTRAST_PAIRS];
}

export function getContrastRatio(firstHex: string, secondHex: string): number {
  const first = getRelativeLuminance(firstHex);
  const second = getRelativeLuminance(secondHex);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

export function checkThemeContrast(theme: SupersetTheme): ThemeContrastResult {
  const checkedPairs = getContrastPairs();
  const warnings = checkedPairs.flatMap((pair) => {
    const ratio = getContrastRatio(
      getThemeTokenValue(theme, pair.foregroundPath),
      getThemeTokenValue(theme, pair.backgroundPath),
    );

    if (ratio >= pair.threshold) {
      return [];
    }

    return [
      {
        ...pair,
        ratio: roundRatio(ratio),
        severity: pair.required ? "error" : "warning",
      } satisfies ContrastWarning,
    ];
  });

  return {
    checkedPairs,
    warnings,
  };
}

function getThemeTokenValue(theme: SupersetTheme, path: ColorTokenPath): string {
  switch (path) {
    case "ui.background":
      return theme.ui.background;
    case "ui.foreground":
      return theme.ui.foreground;
    case "ui.card":
      return theme.ui.card;
    case "ui.cardForeground":
      return theme.ui.cardForeground;
    case "ui.primary":
      return theme.ui.primary;
    case "ui.primaryForeground":
      return theme.ui.primaryForeground;
    case "ui.destructive":
      return theme.ui.destructive;
    case "ui.destructiveForeground":
      return theme.ui.destructiveForeground;
    case "ui.selection":
      return theme.ui.selection;
    case "ui.selectionForeground":
      return theme.ui.selectionForeground;
    case "terminal.background":
      return theme.terminal.background;
    case "terminal.foreground":
      return theme.terminal.foreground;
    case "terminal.selection":
      return theme.terminal.selection;
    case "terminal.selectionForeground":
      return theme.terminal.selectionForeground;
  }
}

function getRelativeLuminance(hex: string): number {
  const { blue, green, red } = parseHexColor(hex);
  const linearRed = toLinearSrgb(red);
  const linearGreen = toLinearSrgb(green);
  const linearBlue = toLinearSrgb(blue);

  return 0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue;
}

function parseHexColor(hex: string): { blue: number; green: number; red: number } {
  const match = /^#(?<red>[0-9a-f]{2})(?<green>[0-9a-f]{2})(?<blue>[0-9a-f]{2})$/i.exec(hex);

  if (!match?.groups) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  const { blue, green, red } = match.groups;

  if (!blue || !green || !red) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  return {
    blue: Number.parseInt(blue, 16) / 255,
    green: Number.parseInt(green, 16) / 255,
    red: Number.parseInt(red, 16) / 255,
  };
}

function toLinearSrgb(channel: number): number {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }

  return ((channel + 0.055) / 1.055) ** 2.4;
}

function roundRatio(ratio: number): number {
  return Math.round(ratio * 100) / 100;
}
