import { expect, test } from "@playwright/test";

const ENTRY_URL = "/compare?a=tokyo-night&b=solarized-light&from=rose-pine-dawn";

test.describe("compare mode", () => {
  test("renders two theme-scoped slots while chrome stays at the entry theme", async ({ page }) => {
    await page.goto(ENTRY_URL);

    const slotA = page.getByRole("region", { name: /compare slot a: tokyo night/i });
    const slotB = page.getByRole("region", { name: /compare slot b: solarized light/i });
    await expect(slotA).toBeVisible();
    await expect(slotB).toBeVisible();

    // Chrome reads :root, which holds the entry-state theme (rose-pine-dawn),
    // not either pinned slot.
    const rootBackground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--preview-ui-background").trim(),
    );
    expect(rootBackground).toBe("#faf4ed");

    // Each slot scopes its own theme inline, so its --preview-ui-background differs
    // from :root and from its sibling.
    const slotABackground = await slotA.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--preview-ui-background").trim(),
    );
    const slotBBackground = await slotB.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--preview-ui-background").trim(),
    );
    expect(slotABackground).toBe("#1a1b26");
    expect(slotBBackground).toBe("#fdf6e3");

    // Both pinned rail rows surface the pin glyph (folded into the accessible name).
    const rail = page.getByRole("complementary", { name: /themes/i });
    await expect(
      rail.getByRole("button", { name: /tokyo night, pinned for compare/i }).first(),
    ).toBeVisible();
    await expect(
      rail.getByRole("button", { name: /solarized light, pinned for compare/i }).first(),
    ).toBeVisible();

    // Bottom bar reports the entry-state theme.
    await expect(page.getByRole("contentinfo")).toContainText(/ros[eé] pine dawn/i);
  });

  test("syncs the scene across both slots", async ({ page }) => {
    await page.goto(ENTRY_URL);

    await page.getByRole("tab", { name: /^settings$/i }).click();
    await expect(page).toHaveURL(/scene=settings/);

    const slotA = page.getByRole("region", { name: /compare slot a/i });
    const slotB = page.getByRole("region", { name: /compare slot b/i });
    await expect(slotA.getByRole("textbox", { name: /display name/i })).toBeVisible();
    await expect(slotB.getByRole("textbox", { name: /display name/i })).toBeVisible();
  });

  test("unpinning a slot clears it and surfaces the fill hint", async ({ page }) => {
    await page.goto(ENTRY_URL);

    await page.getByRole("button", { name: /remove solarized light from comparison/i }).click();

    await expect(page.getByRole("region", { name: /compare slot b, empty/i })).toBeVisible();
    await expect(page.locator(".rail__hint")).toBeVisible();
  });

  test("`.` enters compare mode with the focused theme, and Esc exits", async ({ page }) => {
    await page.goto("/?theme=rose-pine-dawn");
    await expect(page.getByRole("heading", { name: /ros[eé] pine dawn/i }).first()).toBeVisible();

    await page.keyboard.press(".");

    await expect(page).toHaveURL(/compare/);
    const entered = new URL(page.url());
    expect(entered.searchParams.get("a")).toBe("rose-pine-dawn");
    expect(entered.searchParams.get("from")).toBe("rose-pine-dawn");
    await expect(
      page.getByRole("region", { name: /compare slot a: ros[eé] pine dawn/i }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: /compare slot b, empty/i })).toBeVisible();
    await expect(page.locator(".rail__hint")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(/theme=rose-pine-dawn/);
    await expect(page.getByRole("region", { name: /compare slot/i })).toHaveCount(0);
  });

  test("the nameplate Pin to compare button is a synonym for entering compare", async ({
    page,
  }) => {
    await page.goto("/?theme=rose-pine-dawn");

    await page.getByRole("button", { name: /pin to compare/i }).click();

    await expect(page).toHaveURL(/compare/);
    const entered = new URL(page.url());
    expect(entered.searchParams.get("a")).toBe("rose-pine-dawn");
    expect(entered.searchParams.get("from")).toBe("rose-pine-dawn");
    await expect(
      page.getByRole("region", { name: /compare slot a: ros[eé] pine dawn/i }),
    ).toBeVisible();
  });
});
