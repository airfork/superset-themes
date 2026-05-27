import { expect, test } from "@playwright/test";

test("renders the scaffold catalog shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("region", { name: /theme catalog workspace/i })).toBeVisible();
  await expect(page.getByText(/task 1 scaffold/i)).toBeVisible();
});
