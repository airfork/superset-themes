import { readdirSync } from "node:fs";

const themeDir = new URL("../src/data/themes/", import.meta.url);
const themeFiles = readdirSync(themeDir).filter((fileName) => fileName.endsWith(".json"));

const { catalogThemes, catalogThemeMetadata } = await import("../src/data/catalog.ts");
const { catalogThemeMetaSchema, supersetThemeSchema, validateCatalogThemes } = await import(
  "../src/theme-core/schema.ts"
);

const errors = [];
const catalogThemeIds = new Set(catalogThemes.map((entry) => entry.theme.id));

for (const fileName of themeFiles) {
  const theme = await import(new URL(fileName, themeDir), { with: { type: "json" } });
  const result = supersetThemeSchema.safeParse(theme.default);

  if (!result.success) {
    errors.push(`Invalid theme JSON ${fileName}: ${result.error.message}`);
    continue;
  }

  if (!catalogThemeIds.has(result.data.id)) {
    errors.push(`Theme JSON ${fileName} is missing catalog metadata.`);
  }
}

for (const meta of catalogThemeMetadata) {
  const metadataResult = catalogThemeMetaSchema.safeParse(meta);

  if (!metadataResult.success) {
    errors.push(
      `Invalid metadata for ${meta.themeId ?? "unknown"}: ${metadataResult.error.message}`,
    );
    continue;
  }

  if (!catalogThemeIds.has(meta.themeId)) {
    errors.push(`Metadata themeId ${meta.themeId} points at a missing theme.`);
  }
}

const catalogResult = validateCatalogThemes(catalogThemes);

if (!catalogResult.success) {
  errors.push(...catalogResult.errors);
}

if (errors.length > 0) {
  console.error(`Theme validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Validated ${catalogThemes.length} catalog theme(s) from ${themeFiles.length} JSON file(s).`,
);
