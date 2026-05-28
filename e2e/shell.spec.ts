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

  await expect(page.getByRole("button", { name: /search themes/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /repo/i })).toBeVisible();
});

test("shell bottom bar shows the focused theme summary", async ({ page }) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("Tokyo Night");
  await expect(footer).toContainText("⌘K");
});
