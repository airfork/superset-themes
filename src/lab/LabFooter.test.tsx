import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import { exportThemeJson } from "../theme-core/exportTheme";
import { LabFooter } from "./LabFooter";

const base = getCatalogThemeById("aurora-light");

if (!base) {
  throw new Error("Expected aurora-light catalog entry.");
}

describe("LabFooter", () => {
  it("returns to the catalog when Back is clicked", async () => {
    const user = userEvent.setup();
    const onBackToCatalog = vi.fn();
    render(<LabFooter onBackToCatalog={onBackToCatalog} theme={base.theme} />);

    await user.click(screen.getByRole("button", { name: /back to catalog/i }));

    expect(onBackToCatalog).toHaveBeenCalledTimes(1);
  });

  it("copies the exported theme JSON to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<LabFooter onBackToCatalog={vi.fn()} theme={base.theme} />);

    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith(exportThemeJson(base.theme));
  });

  it("downloads the exported theme JSON as a file", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn().mockReturnValue("blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<LabFooter onBackToCatalog={vi.fn()} theme={base.theme} />);

    await user.click(screen.getByRole("button", { name: /download/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });
});
