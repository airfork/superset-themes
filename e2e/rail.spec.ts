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

  // Initial focused theme is Tokyo Night (Featured slot 1).
  const initialBackground = await page.evaluate(
    () => getComputedStyle(document.documentElement).backgroundColor,
  );

  // Move down once. The second Featured row is Catppuccin Mocha.
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/theme=catppuccin-mocha/);

  // Bottom bar reflects Catppuccin Mocha, chrome background shifted.
  await expect(page.getByRole("contentinfo")).toContainText("Catppuccin Mocha");
  const nextBackground = await page.evaluate(
    () => getComputedStyle(document.documentElement).backgroundColor,
  );
  expect(nextBackground).not.toBe(initialBackground);
});

test("/ key opens the palette (placeholder no-op for now)", async ({ page }) => {
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
