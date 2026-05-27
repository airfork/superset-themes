import type { z } from "zod";
import type {
  catalogThemeEntrySchema,
  catalogThemeMetaSchema,
  supersetThemeSchema,
  terminalTokensSchema,
  themeTypeSchema,
  uiTokensSchema,
} from "./schema";

export type ThemeType = z.infer<typeof themeTypeSchema>;
export type UiTokens = z.infer<typeof uiTokensSchema>;
export type TerminalTokens = z.infer<typeof terminalTokensSchema>;
export type SupersetTheme = z.infer<typeof supersetThemeSchema>;
export type CatalogThemeMeta = z.infer<typeof catalogThemeMetaSchema>;
export type CatalogThemeEntry = z.infer<typeof catalogThemeEntrySchema>;
