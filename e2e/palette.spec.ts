import { expect, test } from "@playwright/test";

test.describe("command palette", () => {
  test("⌘K opens the palette and Enter applies the focused theme", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Meta+k");

    const palette = page.getByRole("dialog", { name: /command palette/i });
    await expect(palette).toBeVisible();

    await page.getByRole("combobox", { name: /command palette search/i }).fill("rose");
    await expect(palette.getByRole("option", { name: /rosé pine dawn/i })).toBeVisible();

    await page.keyboard.press("Enter");

    await expect(palette).toBeHidden();
    await expect(page).toHaveURL(/theme=rose-pine-dawn/);
    await expect(page.getByRole("contentinfo")).toContainText(/rosé pine dawn/i);
  });

  test("Escape closes the palette and returns focus to the trigger", async ({ page }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: /search themes/i }).first();
    await trigger.click();

    const palette = page.getByRole("dialog", { name: /command palette/i });
    await expect(palette).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(palette).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
