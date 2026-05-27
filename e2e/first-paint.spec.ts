import { expect, test } from "@playwright/test";

test("first paint renders default theme background", async ({ page }) => {
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  // Tokyo Night ui.background is #1a1b26 → rgb(26, 27, 38)
  expect(bg).toBe("rgb(26, 27, 38)");
});
