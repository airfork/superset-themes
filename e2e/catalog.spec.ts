import { expect, type Page, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const viewport = page.viewportSize();
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(viewport?.width ?? metrics.clientWidth);
}

test("filters catalog results from the visible controls", async ({ page }) => {
  await page.goto("/");

  const search = page.getByRole("searchbox", { name: /search themes/i });
  await search.fill("terminal-rich");

  await expect(page).toHaveURL(/q=terminal-rich/);
  await expect(page.getByRole("article", { name: /aurora dark/i })).toBeVisible();
  await expect(page.getByRole("article", { name: /aurora light/i })).toHaveCount(0);
  await expect(page.getByRole("article", { name: /graphite dark/i })).toHaveCount(0);

  await search.fill("");
  await page.getByRole("radio", { name: "Dark" }).check();
  await page.getByRole("combobox", { name: "Contrast" }).selectOption("high");
  await page.getByRole("combobox", { name: "Terminal palette" }).selectOption("balanced");

  await expect(page).toHaveURL(/type=dark/);
  await expect(page).toHaveURL(/contrast=high/);
  await expect(page).toHaveURL(/terminal=balanced/);
  await expect(page.getByRole("article", { name: /graphite dark/i })).toBeVisible();
  await expect(page.getByRole("article", { name: /aurora dark/i })).toHaveCount(0);

  await search.fill("aurora");

  await expect(page.getByText(/no themes match/i)).toBeVisible();
});

test("opens a catalog card detail route with preview tabs and JSON actions", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("article", { name: /aurora dark/i })
    .getByRole("link", { name: /view details/i })
    .click();

  await expect(page).toHaveURL(/\/themes\/aurora-dark$/);
  await expect(page.getByRole("region", { name: /aurora dark details/i })).toBeVisible();

  const actions = page.getByRole("toolbar", { name: /aurora dark details/i });
  await expect(actions.getByRole("button", { name: /pin light/i })).toBeDisabled();
  await expect(actions.getByRole("button", { name: /pin dark/i })).toBeEnabled();
  await expect(actions.getByRole("link", { name: /edit in lab/i })).toHaveAttribute(
    "href",
    "/lab?from=aurora-dark",
  );
  await expect(actions.getByRole("button", { name: /copy json/i })).toBeEnabled();
  await expect(actions.getByRole("link", { name: /download json/i })).toHaveAttribute(
    "download",
    "aurora-dark.json",
  );

  await page.getByRole("tab", { name: "Terminal" }).click();

  await expect(page.getByRole("tab", { name: "Terminal" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel", { name: "Terminal" })).toContainText(
    "theme preview rebuilt",
  );
});

test("keeps the primary catalog controls reachable in keyboard order", async ({ page }) => {
  await page.goto("/");

  const search = page.getByRole("searchbox", { name: /search themes/i });
  const allThemes = page.getByRole("radio", { name: "All" });
  const family = page.getByRole("combobox", { name: "Family" });
  const source = page.getByRole("combobox", { name: "Source" });

  await search.focus();
  await expect(search).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(allThemes).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(family).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(source).toBeFocused();
});

test("renders catalog and detail content without horizontal overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/");

  await expect(page.getByRole("region", { name: /theme catalog/i })).toBeVisible();
  await expect(page.getByRole("group", { name: /catalog filters/i })).toBeVisible();
  await expect(page.getByRole("article", { name: /aurora light/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /view details/i }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/themes/graphite-dark");

  await expect(page.getByRole("region", { name: /graphite dark details/i })).toBeVisible();
  await expect(page.getByRole("tablist", { name: /preview surfaces/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /download json/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
