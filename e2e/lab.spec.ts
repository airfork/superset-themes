import { expect, test } from "@playwright/test";

test("lab seeds from a catalog theme and drives the shared chrome", async ({ page }) => {
  await page.goto("/lab?from=aurora-light");

  // Lab shares the catalog shell: a Themes rail plus the focused-theme bottom bar.
  const rail = page.getByRole("complementary", { name: /themes/i });
  await expect(rail.getByLabel("Start from catalog theme")).toHaveValue("aurora-light");
  await expect(page.getByRole("contentinfo")).toContainText("Aurora Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme-id", "aurora-light");

  // Reseeding from the rail select updates ?from= and morphs the chrome.
  await rail.getByLabel("Start from catalog theme").selectOption("aurora-dark");
  await expect(page).toHaveURL(/from=aurora-dark/);
  await expect(page.getByRole("contentinfo")).toContainText("Aurora Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme-id", "aurora-dark");
});
