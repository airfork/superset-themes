import { expect, test } from "@playwright/test";

// The legacy catalog → compare pin-link flow disappears with the Phase 3 shell. The compare
// surface returns as a pane-split mode in Phase 6 Task 20, at which point this spec is
// rewritten under e2e/compare.spec.ts.
test.skip("pins light and dark themes into a shared compare route", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /pin light aurora light/i }).click();
  await expect(page).toHaveURL(/\/compare\?tab=workspace&light=aurora-light/);
  await expect(page.getByRole("region", { name: /light theme slot/i })).toContainText(
    "Aurora Light",
  );
  await expect(page.getByRole("region", { name: /dark theme slot/i })).toContainText(
    "No dark theme pinned",
  );

  await page.getByRole("link", { name: /add dark theme/i }).click();
  await expect(page).toHaveURL(/\/\?light=aurora-light&tab=workspace/);

  await page.getByRole("link", { name: /pin dark aurora dark/i }).click();
  await expect(page).toHaveURL(/\/compare\?tab=workspace&light=aurora-light&dark=aurora-dark/);
  await expect(page.getByRole("region", { name: /dark theme slot/i })).toContainText("Aurora Dark");

  const lightSlot = page.getByRole("region", { name: /light theme slot/i });
  const darkSlot = page.getByRole("region", { name: /dark theme slot/i });
  await lightSlot.getByRole("tab", { name: "Terminal" }).click();

  await expect(page).toHaveURL(/tab=terminal/);
  await expect(lightSlot.getByRole("tabpanel", { name: "Terminal" })).toBeVisible();
  await expect(darkSlot.getByRole("tabpanel", { name: "Terminal" })).toBeVisible();
});
