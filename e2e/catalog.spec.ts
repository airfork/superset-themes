import { expect, type Page, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const viewport = page.viewportSize();
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(viewport?.width ?? metrics.clientWidth);
}

test.describe("catalog master/detail shell", () => {
  test("clicking a rail row updates the URL and morphs the chrome", async ({ page }) => {
    // Pin the default so the starting theme is deterministic (a bare visit now seeds
    // a random mode-appropriate featured theme).
    await page.goto("/?theme=tokyo-night");

    // Tokyo Night is the default focused theme; pane nameplate shows its name.
    await expect(page.getByRole("heading", { name: /tokyo night/i }).first()).toBeVisible();

    // Pick Solarized Light from the rail's Light section (Featured also lists
    // the same theme; either entry drives the same focused-theme update).
    const themesRail = page.getByRole("complementary", { name: /themes/i });
    await themesRail
      .getByRole("region", { name: /^light$/i })
      .getByRole("button", { name: /solarized light/i })
      .click();

    await expect(page).toHaveURL(/theme=solarized-light/);
    await expect(page.getByRole("heading", { name: /solarized light/i }).first()).toBeVisible();
    // Bottom bar reports the morphed theme + contrast ratio for the new focused theme.
    await expect(page.getByRole("contentinfo")).toContainText(/solarized light/i);

    // The applied chrome reads from the focused theme's --preview-ui-background.
    const background = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--preview-ui-background").trim(),
    );
    expect(background).toBe("#fdf6e3");
  });

  test("catalog renders the focused workspace scene", async ({ page }) => {
    await page.goto("/?theme=tokyo-night");

    await expect(page.getByRole("region", { name: /tokyo night workspace/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^run ⌘g$/i })).toBeVisible();
  });

  test("pressing `f` expands the pane and hides the rail", async ({ page }) => {
    await page.goto("/");

    const rail = page.getByRole("complementary", { name: /themes/i });
    await expect(rail).toBeVisible();

    await page.keyboard.press("f");
    await expect(rail).toBeHidden();

    await page.keyboard.press("f");
    await expect(rail).toBeVisible();
  });

  test("URL ?theme= hydrates the focused theme on first paint", async ({ page }) => {
    await page.goto("/?theme=rose-pine-dawn");

    await expect(page.getByRole("heading", { name: /rosé pine dawn/i }).first()).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText(/rosé pine dawn/i);
  });

  test("catalog shell has no horizontal overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("button", { name: /browse themes/i })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole("button", { name: /browse themes/i }).click();
    await expect(page.getByRole("complementary", { name: /themes/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
