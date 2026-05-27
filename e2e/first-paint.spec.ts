import { expect, test } from "@playwright/test";

test("first paint renders default theme background", async ({ page }) => {
  await page.goto("/");
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  // Tokyo Night ui.background is #1a1b26 → rgb(26, 27, 38)
  expect(bg).toBe("rgb(26, 27, 38)");
});

test("reduced motion zeroes the transition timing", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const transition = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--app-transition").trim(),
  );
  // Browsers may normalize "0ms" → "0s" when reading the computed custom property.
  expect(["0ms", "0s"]).toContain(transition);
  await context.close();
});
