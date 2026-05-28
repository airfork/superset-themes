// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { buildThemeCommands, type PaletteCommand } from "./commands";
import { Palette } from "./Palette";
import { usePalette } from "./usePalette";

function makeCommands(onSelectTheme: () => void, actionRun: () => void): PaletteCommand[] {
  return [
    ...buildThemeCommands(onSelectTheme),
    {
      id: "open-lab",
      label: "Open in Lab",
      section: "Actions",
      keys: ["open in lab", "lab"],
      run: actionRun,
    },
  ];
}

function Host({ commands }: { commands: PaletteCommand[] }) {
  const { paletteProps } = usePalette(commands);
  return <Palette {...paletteProps} />;
}

function openPalette() {
  fireEvent.keyDown(window, { key: "k", metaKey: true });
}

describe("Palette", () => {
  it("is closed until ⌘K opens it", () => {
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    openPalette();
    expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /tokyo night/i })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters the Themes section as you type", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    await user.keyboard("rose");
    expect(screen.getByRole("option", { name: /rosé pine dawn/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^nord$/i })).not.toBeInTheDocument();
  });

  it("moves the active option with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    const input = screen.getByRole("combobox");
    const first = input.getAttribute("aria-activedescendant");
    await user.keyboard("{ArrowDown}");
    const second = input.getAttribute("aria-activedescendant");

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(second).not.toBe(first);
  });

  it("runs the focused command on Enter and closes", async () => {
    const user = userEvent.setup();
    const onSelectTheme = vi.fn();
    render(<Host commands={makeCommands(onSelectTheme, vi.fn())} />);
    openPalette();

    await user.keyboard("rose");
    await user.keyboard("{Enter}");

    expect(onSelectTheme).toHaveBeenCalledWith("rose-pine-dawn");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("runs an action command when clicked", async () => {
    const user = userEvent.setup();
    const actionRun = vi.fn();
    render(<Host commands={makeCommands(vi.fn(), actionRun)} />);
    openPalette();

    await user.click(screen.getByRole("option", { name: /open in lab/i }));
    expect(actionRun).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
