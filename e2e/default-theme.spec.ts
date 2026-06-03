import { expect, test } from "@playwright/test";

test.describe("time-of-day default theme", () => {
  test("a dark OS preference lands on a dark featured theme and pins the URL", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await expect(page).toHaveURL(/theme=(tokyo-night|catppuccin-mocha)/);
    await expect(page.locator("html")).toHaveAttribute("data-theme-type", "dark");
  });

  test("a light OS preference lands on a light featured theme and pins the URL", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(page).toHaveURL(/theme=(solarized-light|rose-pine-dawn|github-light)/);
    await expect(page.locator("html")).toHaveAttribute("data-theme-type", "light");
  });

  test("an explicit ?theme= overrides the OS preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/?theme=github-light");

    await expect(page.locator("html")).toHaveAttribute("data-theme-id", "github-light");
  });
});
