import { expect, test } from "@playwright/test";

test("catalog route renders the master/detail shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("complementary", { name: /themes/i })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText(/Tokyo Night/);
});

// Catalog filter/sort URL hydration returns in Phase 5 Task 18 when the new rail + pane
// expose theme switching directly. The legacy controls are no longer present.
test.skip("supports shareable catalog search params", async ({ page }) => {
  await page.goto("/?q=graphite&type=dark&sort=accentHue");

  await expect(page.getByRole("searchbox", { name: /search themes/i })).toHaveValue("graphite");
});

test("renders a theme detail route", async ({ page }) => {
  await page.goto("/themes/aurora-dark");

  await expect(page.getByRole("region", { name: /aurora dark details/i })).toBeVisible();
  await expect(page.getByRole("tablist", { name: /preview surfaces/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /pin dark/i })).toBeEnabled();
  await expect(page.getByRole("link", { name: /download json/i })).toHaveAttribute(
    "download",
    "aurora-dark.json",
  );
});
