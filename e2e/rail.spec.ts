import { expect, test } from "@playwright/test";

test("clicking a rail row updates the focused theme and ?theme= param", async ({ page }) => {
  await page.goto("/");

  // Focus enters via the Featured section's first row name.
  const railRegion = page.getByRole("complementary", { name: /themes/i });
  await railRegion
    .getByRole("button", { name: /solarized light/i })
    .first()
    .click();

  await expect(page).toHaveURL(/theme=solarized-light/);
  await expect(page.getByRole("contentinfo")).toContainText("Solarized Light");
});

test("arrow keys morph the chrome to the next theme", async ({ page }) => {
  await page.goto("/");

  const railRegion = page.getByRole("complementary", { name: /themes/i });
  const tokyoButton = railRegion.getByRole("button", { name: /tokyo night/i }).first();
  await tokyoButton.focus();
  await expect(tokyoButton).toBeFocused();

  // Move down once. The second Featured row is Catppuccin Mocha. Native button activation
  // on Enter handles the click; the keyboard hook only manages roving focus and "/".
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/theme=catppuccin-mocha/);
  await expect(page.getByRole("contentinfo")).toContainText("Catppuccin Mocha");

  // Read the inline CSS variable (deterministic) rather than the animated background
  // mid-transition. applyTheme writes the new var synchronously on theme change.
  const previewBackground = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue("--preview-ui-background").trim(),
  );
  expect(previewBackground).toBe("#1e1e2e");
});

test("/ key opens the palette from rail rows (placeholder no-op for now)", async ({ page }) => {
  // The palette is not yet wired in Phase 4. This spec asserts the keyboard handler
  // does not error and does not advance the rail row when "/" is pressed.
  await page.goto("/");

  const railRegion = page.getByRole("complementary", { name: /themes/i });
  await railRegion
    .getByRole("button", { name: /tokyo night/i })
    .first()
    .focus();
  await page.keyboard.press("/");

  // URL stays at the catalog root with no rail-driven param change.
  await expect(page).not.toHaveURL(/theme=/);
});

test("/ key opens the palette from RailSearch (placeholder no-op for now)", async ({ page }) => {
  await page.goto("/");

  const railRegion = page.getByRole("complementary", { name: /themes/i });
  const search = railRegion.getByRole("button", { name: /search themes/i });
  await search.focus();
  await expect(search).toBeFocused();
  await page.keyboard.press("/");

  // RailSearch handler fires onOpenPalette; URL stays clean.
  await expect(page).not.toHaveURL(/theme=/);
});
