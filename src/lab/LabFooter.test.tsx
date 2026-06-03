import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import { exportThemeJson } from "../theme-core/exportTheme";
import { LabFooter } from "./LabFooter";

const base = getCatalogThemeById("aurora-light");

if (!base) {
  throw new Error("Expected aurora-light catalog entry.");
}

const renderFooter = (props: Partial<ComponentProps<typeof LabFooter>> = {}) =>
  render(
    <LabFooter
      canRedo={false}
      canUndo={false}
      onBackToCatalog={vi.fn()}
      onRedo={vi.fn()}
      onUndo={vi.fn()}
      theme={base.theme}
      {...props}
    />,
  );

describe("LabFooter", () => {
  it("returns to the catalog when Back is clicked", async () => {
    const user = userEvent.setup();
    const onBackToCatalog = vi.fn();
    renderFooter({ onBackToCatalog });

    await user.click(screen.getByRole("button", { name: /back to catalog/i }));

    expect(onBackToCatalog).toHaveBeenCalledTimes(1);
  });

  it("copies the exported theme JSON to the clipboard and confirms", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderFooter();

    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith(exportThemeJson(base.theme));
    expect(screen.getByRole("status")).toHaveTextContent(/copied/i);
  });

  it("downloads the exported theme JSON as a file and confirms", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn().mockReturnValue("blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderFooter();

    await user.click(screen.getByRole("button", { name: /download/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(/downloaded/i);
    click.mockRestore();
  });

  it("disables Undo and Redo until there is history to move through", () => {
    renderFooter({ canRedo: false, canUndo: false });

    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo/i })).toBeDisabled();
  });

  it("undoes the last change when Undo is clicked", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    renderFooter({ canUndo: true, onUndo });

    const undo = screen.getByRole("button", { name: /undo/i });
    expect(undo).toBeEnabled();
    await user.click(undo);

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("redoes when Redo is clicked", async () => {
    const user = userEvent.setup();
    const onRedo = vi.fn();
    renderFooter({ canRedo: true, onRedo });

    const redo = screen.getByRole("button", { name: /redo/i });
    expect(redo).toBeEnabled();
    await user.click(redo);

    expect(onRedo).toHaveBeenCalledTimes(1);
  });
});
