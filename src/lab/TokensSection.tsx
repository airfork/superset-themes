import { RotateCw } from "lucide-react";
import type { TerminalTokens, UiTokens } from "../theme-core/themeTypes";
import { ColorField } from "./ColorField";
import type { ThemeDraft } from "./draftTheme";
import type { RandomThemeTokenGroup } from "./randomTheme";

type TokenRow =
  | { label: string; namespace: "ui"; token: keyof UiTokens }
  | { label: string; namespace: "terminal"; token: keyof TerminalTokens };

interface TokenGroup {
  group: RandomThemeTokenGroup;
  label: string;
  rows: TokenRow[];
}

// Display groups mirror the generator's reroll groups (see `applyLocks` in
// randomTheme.ts) so each sticky header's reroll button maps to a real group.
// Every UI + terminal token appears in exactly one group.
const TOKEN_GROUPS: TokenGroup[] = [
  {
    group: "surfaces",
    label: "Surfaces",
    rows: [
      { label: "Background", namespace: "ui", token: "background" },
      { label: "Foreground", namespace: "ui", token: "foreground" },
      { label: "Card", namespace: "ui", token: "card" },
      { label: "Card foreground", namespace: "ui", token: "cardForeground" },
      { label: "Popover", namespace: "ui", token: "popover" },
      { label: "Popover foreground", namespace: "ui", token: "popoverForeground" },
      { label: "Border", namespace: "ui", token: "border" },
      { label: "Input", namespace: "ui", token: "input" },
      { label: "Muted", namespace: "ui", token: "muted" },
      { label: "Muted foreground", namespace: "ui", token: "mutedForeground" },
      { label: "Secondary", namespace: "ui", token: "secondary" },
      { label: "Secondary foreground", namespace: "ui", token: "secondaryForeground" },
    ],
  },
  {
    group: "accent",
    label: "Accent",
    rows: [
      { label: "Primary", namespace: "ui", token: "primary" },
      { label: "Primary foreground", namespace: "ui", token: "primaryForeground" },
      { label: "Accent", namespace: "ui", token: "accent" },
      { label: "Accent foreground", namespace: "ui", token: "accentForeground" },
      { label: "Destructive", namespace: "ui", token: "destructive" },
      { label: "Destructive foreground", namespace: "ui", token: "destructiveForeground" },
    ],
  },
  {
    group: "highlights",
    label: "Highlights",
    rows: [
      { label: "Focus ring", namespace: "ui", token: "ring" },
      { label: "Selection", namespace: "ui", token: "selection" },
      { label: "Selection foreground", namespace: "ui", token: "selectionForeground" },
      { label: "Terminal selection", namespace: "terminal", token: "selection" },
      {
        label: "Terminal selection foreground",
        namespace: "terminal",
        token: "selectionForeground",
      },
    ],
  },
  {
    group: "terminal",
    label: "Terminal",
    rows: [
      { label: "Background", namespace: "terminal", token: "background" },
      { label: "Foreground", namespace: "terminal", token: "foreground" },
      { label: "Cursor", namespace: "terminal", token: "cursor" },
      { label: "Black", namespace: "terminal", token: "black" },
      { label: "Red", namespace: "terminal", token: "red" },
      { label: "Green", namespace: "terminal", token: "green" },
      { label: "Yellow", namespace: "terminal", token: "yellow" },
      { label: "Blue", namespace: "terminal", token: "blue" },
      { label: "Magenta", namespace: "terminal", token: "magenta" },
      { label: "Cyan", namespace: "terminal", token: "cyan" },
      { label: "White", namespace: "terminal", token: "white" },
      { label: "Bright black", namespace: "terminal", token: "brightBlack" },
      { label: "Bright red", namespace: "terminal", token: "brightRed" },
      { label: "Bright green", namespace: "terminal", token: "brightGreen" },
      { label: "Bright yellow", namespace: "terminal", token: "brightYellow" },
      { label: "Bright blue", namespace: "terminal", token: "brightBlue" },
      { label: "Bright magenta", namespace: "terminal", token: "brightMagenta" },
      { label: "Bright cyan", namespace: "terminal", token: "brightCyan" },
      { label: "Bright white", namespace: "terminal", token: "brightWhite" },
    ],
  },
];

interface TokensSectionProps {
  draft: ThemeDraft;
  onRerollGroup: (group: RandomThemeTokenGroup) => void;
  onTerminalTokenChange: (token: keyof TerminalTokens, value: string) => void;
  onUiTokenChange: (token: keyof UiTokens, value: string) => void;
}

export function TokensSection({
  draft,
  onRerollGroup,
  onTerminalTokenChange,
  onUiTokenChange,
}: TokensSectionProps) {
  return (
    <div className="lab-tokens">
      {TOKEN_GROUPS.map(({ group, label, rows }) => (
        <div className="lab-tokens__group" key={group}>
          <header className="lab-tokens__header">
            <h2 className="lab-tokens__title">{label}</h2>
            <button
              aria-label={`Reroll ${label.toLowerCase()} tokens`}
              className="lab-tokens__reroll"
              onClick={() => onRerollGroup(group)}
              type="button"
            >
              <RotateCw aria-hidden="true" />
            </button>
          </header>
          <div className="lab-tokens__rows">
            {rows.map((row) =>
              row.namespace === "ui" ? (
                <ColorField
                  id={`lab-token-ui-${row.token}`}
                  key={`ui-${row.token}`}
                  label={row.label}
                  onChange={(value) => onUiTokenChange(row.token, value)}
                  value={draft.theme.ui[row.token]}
                />
              ) : (
                <ColorField
                  id={`lab-token-terminal-${row.token}`}
                  key={`terminal-${row.token}`}
                  label={row.label}
                  onChange={(value) => onTerminalTokenChange(row.token, value)}
                  value={draft.theme.terminal[row.token]}
                />
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
