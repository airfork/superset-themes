import { getChromeMutedForeground, getChromeSurface } from "../theme-core/chromeTokens";
import type { SupersetTheme } from "../theme-core/themeTypes";

export type ThemeCssVars = Record<`--preview-${string}` | `--chrome-${string}`, string>;

export function getThemeCssVars(theme: SupersetTheme): ThemeCssVars {
  return {
    // Chrome neutrals are derived (not raw tokens) so persistent chrome keeps its
    // own AA legibility and primary/secondary split on every theme. See chromeTokens.
    "--chrome-surface": getChromeSurface(theme),
    "--chrome-muted-foreground": getChromeMutedForeground(theme),
    "--preview-ui-accent": theme.ui.accent,
    "--preview-ui-accent-foreground": theme.ui.accentForeground,
    "--preview-ui-background": theme.ui.background,
    "--preview-ui-border": theme.ui.border,
    "--preview-ui-card": theme.ui.card,
    "--preview-ui-card-foreground": theme.ui.cardForeground,
    "--preview-ui-destructive": theme.ui.destructive,
    "--preview-ui-destructive-foreground": theme.ui.destructiveForeground,
    "--preview-ui-foreground": theme.ui.foreground,
    "--preview-ui-input": theme.ui.input,
    "--preview-ui-muted": theme.ui.muted,
    "--preview-ui-muted-foreground": theme.ui.mutedForeground,
    "--preview-ui-popover": theme.ui.popover,
    "--preview-ui-popover-foreground": theme.ui.popoverForeground,
    "--preview-ui-primary": theme.ui.primary,
    "--preview-ui-primary-foreground": theme.ui.primaryForeground,
    "--preview-ui-ring": theme.ui.ring,
    "--preview-ui-secondary": theme.ui.secondary,
    "--preview-ui-secondary-foreground": theme.ui.secondaryForeground,
    "--preview-ui-selection": theme.ui.selection,
    "--preview-ui-selection-foreground": theme.ui.selectionForeground,
    "--preview-terminal-background": theme.terminal.background,
    "--preview-terminal-black": theme.terminal.black,
    "--preview-terminal-blue": theme.terminal.blue,
    "--preview-terminal-bright-black": theme.terminal.brightBlack,
    "--preview-terminal-bright-blue": theme.terminal.brightBlue,
    "--preview-terminal-bright-cyan": theme.terminal.brightCyan,
    "--preview-terminal-bright-green": theme.terminal.brightGreen,
    "--preview-terminal-bright-magenta": theme.terminal.brightMagenta,
    "--preview-terminal-bright-red": theme.terminal.brightRed,
    "--preview-terminal-bright-white": theme.terminal.brightWhite,
    "--preview-terminal-bright-yellow": theme.terminal.brightYellow,
    "--preview-terminal-cursor": theme.terminal.cursor,
    "--preview-terminal-cyan": theme.terminal.cyan,
    "--preview-terminal-foreground": theme.terminal.foreground,
    "--preview-terminal-green": theme.terminal.green,
    "--preview-terminal-magenta": theme.terminal.magenta,
    "--preview-terminal-red": theme.terminal.red,
    "--preview-terminal-selection": theme.terminal.selection,
    "--preview-terminal-selection-foreground": theme.terminal.selectionForeground,
    "--preview-terminal-white": theme.terminal.white,
    "--preview-terminal-yellow": theme.terminal.yellow,
  };
}
