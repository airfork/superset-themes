const { catalogThemes } = await import("../src/data/catalog.ts");
const { checkThemeContrast } = await import("../src/theme-core/contrast.ts");

const failingThemes = [];
let warningCount = 0;

for (const entry of catalogThemes) {
  const result = checkThemeContrast(entry.theme);
  const errors = result.warnings.filter((warning) => warning.severity === "error");
  const warnings = result.warnings.filter((warning) => warning.severity === "warning");
  const invalidColors = result.invalidColors;

  warningCount += warnings.length;

  if (errors.length === 0 && warnings.length === 0 && invalidColors.length === 0) {
    console.log(`PASS ${entry.theme.id}: ${result.checkedPairs.length} contrast pair(s) checked.`);
    continue;
  }

  if (errors.length > 0 || invalidColors.length > 0) {
    failingThemes.push(entry.theme.id);
  }

  console.log(
    `${errors.length > 0 || invalidColors.length > 0 ? "FAIL" : "WARN"} ${entry.theme.id}: ${
      errors.length + invalidColors.length
    } error(s), ${warnings.length} warning(s).`,
  );

  for (const invalidColor of invalidColors) {
    console.log(
      `  - ERROR ${invalidColor.tokenPath}: ${invalidColor.message} (${invalidColor.label})`,
    );
  }

  for (const warning of result.warnings) {
    console.log(
      `  - ${warning.severity.toUpperCase()} ${warning.foregroundPath} on ${
        warning.backgroundPath
      }: ${warning.ratio.toFixed(2)} < ${warning.threshold.toFixed(1)}`,
    );
  }
}

if (failingThemes.length > 0) {
  console.error(
    `Theme contrast failed for ${failingThemes.length} theme(s): ${failingThemes.join(", ")}.`,
  );
  process.exit(1);
}

console.log(
  `Theme contrast passed for ${catalogThemes.length} theme(s)${
    warningCount > 0 ? ` with ${warningCount} optional warning(s)` : ""
  }.`,
);
