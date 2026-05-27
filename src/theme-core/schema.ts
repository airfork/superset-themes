import { z } from "zod";

const colorTokenSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use six-digit hex colors.");

export const themeTypeSchema = z.enum(["light", "dark"]);

export const uiTokensSchema = z
  .object({
    accent: colorTokenSchema,
    accentForeground: colorTokenSchema,
    background: colorTokenSchema,
    border: colorTokenSchema,
    card: colorTokenSchema,
    cardForeground: colorTokenSchema,
    destructive: colorTokenSchema,
    destructiveForeground: colorTokenSchema,
    foreground: colorTokenSchema,
    input: colorTokenSchema,
    muted: colorTokenSchema,
    mutedForeground: colorTokenSchema,
    popover: colorTokenSchema,
    popoverForeground: colorTokenSchema,
    primary: colorTokenSchema,
    primaryForeground: colorTokenSchema,
    ring: colorTokenSchema,
    secondary: colorTokenSchema,
    secondaryForeground: colorTokenSchema,
    selection: colorTokenSchema,
    selectionForeground: colorTokenSchema,
  })
  .strict();

export const terminalTokensSchema = z
  .object({
    background: colorTokenSchema,
    black: colorTokenSchema,
    blue: colorTokenSchema,
    brightBlack: colorTokenSchema,
    brightBlue: colorTokenSchema,
    brightCyan: colorTokenSchema,
    brightGreen: colorTokenSchema,
    brightMagenta: colorTokenSchema,
    brightRed: colorTokenSchema,
    brightWhite: colorTokenSchema,
    brightYellow: colorTokenSchema,
    cursor: colorTokenSchema,
    cyan: colorTokenSchema,
    foreground: colorTokenSchema,
    green: colorTokenSchema,
    magenta: colorTokenSchema,
    red: colorTokenSchema,
    selection: colorTokenSchema,
    selectionForeground: colorTokenSchema,
    white: colorTokenSchema,
    yellow: colorTokenSchema,
  })
  .strict();

export const supersetThemeSchema = z
  .object({
    $schema: z.string().optional(),
    author: z.string().min(1),
    description: z.string().min(1),
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use kebab-case theme IDs."),
    name: z.string().min(1),
    terminal: terminalTokensSchema,
    type: themeTypeSchema,
    ui: uiTokensSchema,
    version: z.literal(1),
  })
  .strict();

export const catalogThemeMetaSchema = z
  .object({
    accentHue: z.number().min(0).max(360),
    contrastTier: z.enum(["standard", "high"]),
    family: z.string().min(1),
    featuredRank: z.number().int().min(1).max(5).nullable(),
    license: z.string().min(1),
    notes: z.string().min(1),
    pairGroup: z.string().min(1).optional(),
    portStatus: z.enum(["original", "ported", "adapted"]),
    source: z.enum(["fixture", "upstream-port", "generated"]),
    styleTags: z.array(z.string().min(1)).min(1),
    terminalPaletteQuality: z.enum(["basic", "balanced", "rich"]),
    themeId: z.string().min(1),
    upstreamUrl: z.url().nullable(),
    variant: z.enum(["light", "dark"]),
    warmth: z.enum(["cool", "neutral", "warm"]),
  })
  .strict();

export const catalogThemeEntrySchema = z
  .object({
    meta: catalogThemeMetaSchema,
    theme: supersetThemeSchema,
  })
  .strict();

export type CatalogValidationResult =
  | {
      errors: [];
      success: true;
    }
  | {
      errors: string[];
      success: false;
    };

export function validateCatalogThemes(entries: unknown[]): CatalogValidationResult {
  const errors: string[] = [];
  const themeIds = new Set<string>();
  const pairGroups = new Map<string, { themeIds: string[]; variants: Set<"dark" | "light"> }>();

  for (const [index, entry] of entries.entries()) {
    const parsedEntry = catalogThemeEntrySchema.safeParse(entry);

    if (!parsedEntry.success) {
      errors.push(`Invalid catalog entry at index ${index}: ${parsedEntry.error.message}`);
      continue;
    }

    const { meta, theme } = parsedEntry.data;

    if (themeIds.has(theme.id)) {
      errors.push(`Duplicate theme id: ${theme.id}`);
    }

    themeIds.add(theme.id);

    if (meta.themeId !== theme.id) {
      errors.push(`Metadata themeId ${meta.themeId} does not match theme id ${theme.id}`);
    }

    if (meta.variant !== theme.type) {
      errors.push(`Metadata variant ${meta.variant} does not match theme type ${theme.type}`);
    }

    if (meta.pairGroup) {
      const group = pairGroups.get(meta.pairGroup) ?? {
        themeIds: [],
        variants: new Set<"dark" | "light">(),
      };
      group.themeIds.push(theme.id);
      group.variants.add(theme.type);
      pairGroups.set(meta.pairGroup, group);
    }
  }

  for (const [pairGroup, group] of pairGroups) {
    if (group.themeIds.length < 2) {
      errors.push(`Pair group ${pairGroup} is missing a paired theme.`);
    }

    if (!group.variants.has("light") || !group.variants.has("dark")) {
      errors.push(`Pair group ${pairGroup} must include one light and one dark theme.`);
    }
  }

  if (errors.length > 0) {
    return {
      errors,
      success: false,
    };
  }

  return {
    errors: [],
    success: true,
  };
}
