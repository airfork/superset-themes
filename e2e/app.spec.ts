import { expect, test } from "@playwright/test";

test("renders the catalog browsing workspace", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("region", { name: /theme catalog/i })).toBeVisible();
  await expect(page.getByRole("article", { name: /aurora light/i })).toBeVisible();
  await expect(page.getByRole("article", { name: /graphite dark/i })).toBeVisible();
});

test("supports shareable catalog search params", async ({ page }) => {
  await page.goto("/?q=graphite&type=dark&sort=accentHue");

  await expect(page.getByRole("searchbox", { name: /search themes/i })).toHaveValue("graphite");
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
  await expect(page.getByRole("combobox", { name: "Sort" })).toHaveValue("accentHue");
  await expect(page.getByRole("article", { name: /graphite dark/i })).toBeVisible();
  await expect(page.getByRole("article", { name: /aurora dark/i })).toHaveCount(0);
});

test("renders a theme detail route", async ({ page }) => {
  await page.goto("/themes/aurora-dark");

  await expect(page.getByRole("region", { name: /aurora dark details/i })).toBeVisible();
  await expect(page.getByRole("tablist", { name: /preview surfaces/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /pin dark/i })).toBeEnabled();
  await expect(page.getByRole("link", { name: /download json/i })).toHaveAttribute(
    "download",
    "aurora-dark.json",
  );
});
