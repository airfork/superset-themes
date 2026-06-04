import { expect, test } from "@playwright/test";

const ENTRY_URL = "/compare?a=tokyo-night&b=solarized-light";

test.describe("compare mode", () => {
  test("renders baseline and candidate slots with the chrome following the baseline", async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);

    const baseline = page.getByRole("region", { name: /baseline: tokyo night/i });
    const candidate = page.getByRole("region", { name: /comparing: solarized light/i });
    await expect(baseline).toBeVisible();
    await expect(candidate).toBeVisible();

    // Chrome reads :root, which now follows the baseline (slot A, tokyo night).
    const rootBackground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--preview-ui-background").trim(),
    );
    expect(rootBackground).toBe("#1a1b26");

    // Each slot scopes its own theme inline. The baseline matches :root; the
    // candidate scopes solarized light, so its --preview-ui-background differs.
    const baselineBackground = await baseline.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--preview-ui-background").trim(),
    );
    const candidateBackground = await candidate.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--preview-ui-background").trim(),
    );
    expect(baselineBackground).toBe("#1a1b26");
    expect(candidateBackground).toBe("#fdf6e3");

    // The bottom bar reports both compared themes.
    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText(/tokyo night/i);
    await expect(footer).toContainText(/solarized light/i);
  });

  test("syncs the scene across both slots", async ({ page }) => {
    await page.goto(ENTRY_URL);

    await page.getByRole("tab", { name: /^settings$/i }).click();
    await expect(page).toHaveURL(/scene=settings/);

    const baseline = page.getByRole("region", { name: /baseline: tokyo night/i });
    const candidate = page.getByRole("region", { name: /comparing: solarized light/i });
    await expect(baseline.getByRole("textbox", { name: /display name/i })).toBeVisible();
    await expect(candidate.getByRole("textbox", { name: /display name/i })).toBeVisible();
  });

  test("only the candidate row carries the pinned marker; the baseline reads as current", async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);

    const rail = page.getByRole("complementary", { name: /themes/i });

    // The candidate (solarized light) surfaces the pin glyph in its accessible name.
    await expect(
      rail.getByRole("button", { name: /solarized light, pinned for compare/i }).first(),
    ).toBeVisible();

    // The baseline (tokyo night) is the current theme, not pinned: it carries
    // aria-current="true" and never reads as "pinned for compare".
    const baselineRow = rail.getByRole("button", { name: /^tokyo night/i }).first();
    await expect(baselineRow).toHaveAttribute("aria-current", "true");
    await expect(
      rail.getByRole("button", { name: /tokyo night, pinned for compare/i }),
    ).toHaveCount(0);
  });

  test("clearing the candidate empties its slot and surfaces the fill hint", async ({ page }) => {
    await page.goto(ENTRY_URL);

    await page.getByRole("button", { name: /remove solarized light from comparison/i }).click();

    await expect(page.getByRole("region", { name: /comparing slot, empty/i })).toBeVisible();
    await expect(page.locator(".rail__hint")).toBeVisible();
  });

  test("picking different themes swaps the candidate while the baseline never changes", async ({
    page,
  }) => {
    await page.goto(ENTRY_URL);

    const baseline = page.getByRole("region", { name: /baseline: tokyo night/i });
    const rail = page.getByRole("complementary", { name: /themes/i });
    await expect(baseline).toBeVisible();

    // Each pick lands in the candidate; the baseline (tokyo night) is fixed.
    for (const name of ["Nord", "Gruvbox Dark", "Solarized Dark"]) {
      await rail
        .getByRole("button", { name: new RegExp(`^${name}`, "i") })
        .first()
        .click();
      await expect(
        page.getByRole("region", { name: new RegExp(`comparing: ${name}`, "i") }),
      ).toBeVisible();
      // The baseline region is unchanged after every pick — this is the core fix.
      await expect(baseline).toBeVisible();
    }
  });

  test("swapping exchanges the baseline and candidate", async ({ page }) => {
    await page.goto(ENTRY_URL);

    await page.getByRole("button", { name: /swap baseline and candidate/i }).click();

    await expect(page.getByRole("region", { name: /baseline: solarized light/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /comparing: tokyo night/i })).toBeVisible();

    // The chrome now follows the new baseline (solarized light).
    const rootBackground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--preview-ui-background").trim(),
    );
    expect(rootBackground).toBe("#fdf6e3");
  });

  test("`.` enters compare mode with the focused theme as baseline, and Esc exits", async ({
    page,
  }) => {
    await page.goto("/?theme=rose-pine-dawn");
    await expect(page.getByRole("heading", { name: /ros[eé] pine dawn/i }).first()).toBeVisible();

    await page.keyboard.press(".");

    await expect(page).toHaveURL(/compare/);
    const entered = new URL(page.url());
    expect(entered.searchParams.get("a")).toBe("rose-pine-dawn");
    expect(entered.searchParams.get("from")).toBeNull();
    await expect(page.getByRole("region", { name: /baseline: ros[eé] pine dawn/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /comparing slot, empty/i })).toBeVisible();
    await expect(page.locator(".rail__hint")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(/theme=rose-pine-dawn/);
    await expect(page.getByRole("region", { name: /baseline:/i })).toHaveCount(0);
    await expect(page.getByRole("region", { name: /comparing/i })).toHaveCount(0);
  });

  test("the nameplate Pin to compare button is a synonym for entering compare", async ({
    page,
  }) => {
    await page.goto("/?theme=rose-pine-dawn");

    await page.getByRole("button", { name: /pin to compare/i }).click();

    await expect(page).toHaveURL(/compare/);
    const entered = new URL(page.url());
    expect(entered.searchParams.get("a")).toBe("rose-pine-dawn");
    expect(entered.searchParams.get("from")).toBeNull();
    await expect(page.getByRole("region", { name: /baseline: ros[eé] pine dawn/i })).toBeVisible();
  });
});
