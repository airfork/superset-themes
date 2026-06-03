import { expect, test } from "@playwright/test";

test("catalog route renders the master/detail shell landmarks", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("complementary", { name: /themes/i })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("shell top bar exposes a search trigger and repo link", async ({ page }) => {
  await page.goto("/");

  const banner = page.getByRole("banner");
  await expect(banner.getByRole("button", { name: /search themes/i })).toBeVisible();
  await expect(banner.getByRole("link", { name: /github/i })).toBeVisible();
});

test("shell bottom bar shows the focused theme summary", async ({ page }) => {
  await page.goto("/?theme=tokyo-night");

  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("Tokyo Night");
  await expect(footer).toContainText("⌘K");
});

test.describe("skip link reaches a main landmark on every route", () => {
  for (const route of ["/", "/themes/aurora-dark", "/compare", "/lab"] as const) {
    test(`skip link targets #main-content on ${route}`, async ({ page }) => {
      await page.goto(route);

      const skipLink = page.getByRole("link", { name: /skip to main content/i });
      await expect(skipLink).toHaveAttribute("href", "#main-content");

      const main = page.locator("#main-content");
      await expect(main).toBeVisible();
      // Verify it is also the page's primary landmark.
      await expect(main).toHaveAttribute("id", "main-content");
      const tag = await main.evaluate((node) => node.tagName.toLowerCase());
      expect(tag).toBe("main");
    });
  }
});
