import { exportThemeJson } from "../theme-core/exportTheme";
import type {
  CatalogThemeEntry,
  SupersetTheme,
  TerminalTokens,
  UiTokens,
} from "../theme-core/themeTypes";

export type DraftSource =
  | {
      originalTheme: SupersetTheme;
      themeId: string;
      type: "catalog";
    }
  | {
      originalTheme: SupersetTheme;
      type: "import";
    }
  | {
      originalTheme: SupersetTheme;
      type: "generated";
    };

export interface ThemeDraft {
  dirty: boolean;
  source: DraftSource;
  theme: SupersetTheme;
}

function cloneTheme(theme: SupersetTheme): SupersetTheme {
  return structuredClone(theme);
}

export function createDraftFromCatalogEntry(entry: CatalogThemeEntry): ThemeDraft {
  return {
    dirty: false,
    source: {
      originalTheme: cloneTheme(entry.theme),
      themeId: entry.theme.id,
      type: "catalog",
    },
    theme: cloneTheme(entry.theme),
  };
}

export function createDraftFromImportedTheme(theme: SupersetTheme): ThemeDraft {
  return {
    dirty: false,
    source: {
      originalTheme: cloneTheme(theme),
      type: "import",
    },
    theme: cloneTheme(theme),
  };
}

export function createDraftFromGeneratedTheme(theme: SupersetTheme): ThemeDraft {
  return {
    dirty: false,
    source: {
      originalTheme: cloneTheme(theme),
      type: "generated",
    },
    theme: cloneTheme(theme),
  };
}

export function resetDraftToSource(draft: ThemeDraft): ThemeDraft {
  return {
    ...draft,
    dirty: false,
    theme: cloneTheme(draft.source.originalTheme),
  };
}

export function updateDraftUiToken<TKey extends keyof UiTokens>(
  draft: ThemeDraft,
  token: TKey,
  value: UiTokens[TKey],
): ThemeDraft {
  const nextUi = {
    ...draft.theme.ui,
    [token]: value,
  };

  if (token === "selection") {
    nextUi.highlightActive = value;
    nextUi.highlightMatch = value;
    nextUi.highlight = value;
  }

  if (token === "selectionForeground") {
    nextUi.highlightForeground = value;
  }

  return {
    ...draft,
    dirty: true,
    theme: {
      ...draft.theme,
      ui: nextUi,
    },
  };
}

export function updateDraftTerminalToken<TKey extends keyof TerminalTokens>(
  draft: ThemeDraft,
  token: TKey,
  value: TerminalTokens[TKey],
): ThemeDraft {
  const nextTerminal = {
    ...draft.theme.terminal,
    [token]: value,
  };

  if (token === "selection") {
    nextTerminal.selectionBackground = value;
  }

  return {
    ...draft,
    dirty: true,
    theme: {
      ...draft.theme,
      terminal: nextTerminal,
    },
  };
}

export function exportDraftThemeJson(draft: ThemeDraft): string {
  return exportThemeJson(draft.theme);
}
