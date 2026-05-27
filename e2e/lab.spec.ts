import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const graphiteDarkJson = readFileSync(
  new URL("../src/data/themes/graphite-dark.json", import.meta.url),
  "utf8",
);

test("imports, edits, previews, and exports a lab draft", async ({ page }) => {
  await page.goto("/lab?from=aurora-light");

  await expect(page.getByRole("region", { name: /theme lab/i })).toBeVisible();
  await expect(page.getByRole("complementary", { name: /lab controls/i })).toContainText(
    "Aurora Light",
  );

  await page.getByLabel("Start from catalog theme").selectOption("aurora-dark");
  await expect(page.getByRole("complementary", { name: /lab controls/i })).toContainText(
    "Aurora Dark",
  );

  await page.getByLabel("UI accent").fill("#123456");
  await expect(page.getByLabel("UI accent")).toHaveValue("#123456");
  await expect(page.getByText("Unsaved changes")).toBeVisible();
  await expect(page.getByRole("group", { name: /aurora dark preview/i })).toHaveAttribute(
    "style",
    /--preview-ui-accent: #123456/,
  );

  await page.getByLabel("Generator seed").fill("atlas");
  await page.getByRole("button", { name: "Generate dark" }).click();
  await expect(page.getByRole("complementary", { name: /lab controls/i })).toContainText(
    "Generated Atlas Dark",
  );
  await expect(page.getByRole("group", { name: /generated atlas dark preview/i })).toBeVisible();
  await page.getByRole("button", { name: "Reroll accent" }).click();
  await expect(page.getByText("Contrast checks clear")).toBeVisible();

  await page.getByLabel("Import theme JSON").fill("{ nope");
  await page.getByRole("button", { name: "Import JSON" }).click();
  await expect(page.getByText(/invalid json/i)).toBeVisible();

  await page.getByLabel("Import theme JSON").fill(graphiteDarkJson);
  await page.getByRole("button", { name: "Import JSON" }).click();
  await expect(page.getByRole("complementary", { name: /lab controls/i })).toContainText(
    "Graphite Dark",
  );
  await expect(page.getByRole("link", { name: "Download JSON" })).toHaveAttribute(
    "download",
    "graphite-dark.json",
  );
});
