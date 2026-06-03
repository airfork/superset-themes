import { expect, test } from "@playwright/test";

test("catalog route renders the master/detail shell", async ({ page }) => {
  // Pin a theme so the focused default is deterministic (a bare visit now seeds a
  // random mode-appropriate featured theme).
  await page.goto("/?theme=tokyo-night");

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

// Theme detail is folded into the catalog as ?theme=<id> (Task 18). The legacy
// /themes/:id route no longer exists; the rail-driven URL hydration is covered
// by e2e/catalog.spec.ts.
