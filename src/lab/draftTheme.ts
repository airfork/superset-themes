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
  return {
    ...draft,
    dirty: true,
    theme: {
      ...draft.theme,
      ui: {
        ...draft.theme.ui,
        [token]: value,
      },
    },
  };
}

export function updateDraftTerminalToken<TKey extends keyof TerminalTokens>(
  draft: ThemeDraft,
  token: TKey,
  value: TerminalTokens[TKey],
): ThemeDraft {
  return {
    ...draft,
    dirty: true,
    theme: {
      ...draft.theme,
      terminal: {
        ...draft.theme.terminal,
        [token]: value,
      },
    },
  };
}

export function exportDraftThemeJson(draft: ThemeDraft): string {
  return exportThemeJson(draft.theme);
}
