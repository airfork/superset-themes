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

test("contrast summary flags a low-contrast edit and jumps to the token", async ({ page }) => {
  await page.goto("/lab?from=aurora-light");
  const rail = page.getByRole("complementary", { name: /themes/i });

  // Collapse muted text onto the background so the bg/muted pair fails AA.
  const background = await rail.getByLabel("Background hex").first().inputValue();
  const mutedForeground = rail.getByLabel("Muted foreground hex");
  await mutedForeground.fill(background);
  await mutedForeground.blur();

  // The contrast summary surfaces the failing pair; clicking it returns focus
  // to the offending token's editor.
  const warning = rail.getByRole("button", {
    name: /muted foreground on background.*aa fail/i,
  });
  await expect(warning).toBeVisible();
  await warning.click();

  await expect(mutedForeground).toBeFocused();
});

test("⌘K in the lab reseeds the draft from another theme", async ({ page }) => {
  await page.goto("/lab?from=aurora-light");
  await expect(
    page.getByRole("complementary", { name: /themes/i }).getByLabel("Start from catalog theme"),
  ).toHaveValue("aurora-light");

  await page.keyboard.press("Meta+k");
  const palette = page.getByRole("dialog", { name: /command palette/i });
  await expect(palette).toBeVisible();

  await page.getByRole("combobox", { name: /command palette search/i }).fill("solarized light");
  await expect(palette.getByRole("option", { name: /solarized light/i })).toBeVisible();
  await page.keyboard.press("Enter");

  // In the lab the Themes section seeds the draft (?from=) instead of routing
  // to a catalog detail.
  await expect(page).toHaveURL(/from=solarized-light/);
  await expect(page.locator("html")).toHaveAttribute("data-theme-id", "solarized-light");
  await expect(
    page.getByRole("complementary", { name: /themes/i }).getByLabel("Start from catalog theme"),
  ).toHaveValue("solarized-light");
});

test("lab hides the editor rail until the preview has enough width", async ({ page }) => {
  await page.setViewportSize({ width: 721, height: 900 });
  await page.goto("/lab?from=aurora-dark");

  const paneBody = page.locator(".pane__body");
  const overflow = await paneBody.evaluate((element) => element.scrollWidth - element.clientWidth);

  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByText(/open the theme bench on a wider screen/i)).toBeVisible();
});

test("lab mobile notice does not make the shell taller than the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab?from=aurora-dark");

  const metrics = await page.locator(".layout-shell").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));

  expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
});
