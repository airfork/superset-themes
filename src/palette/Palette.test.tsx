// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("collapses Actions to a single row on an empty query so themes own the panel", () => {
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    // At rest the Actions shelf is one "More actions" row, not the full list, so
    // the theme list reclaims the panel instead of being squeezed to a porthole.
    expect(screen.getByRole("option", { name: /more actions/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /open in lab/i })).not.toBeInTheDocument();
    // Themes are still fully present above the shelf.
    expect(screen.getByRole("option", { name: /tokyo night/i })).toBeInTheDocument();
  });

  it("expands the Actions group when the More actions row is activated, staying open", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    await user.click(screen.getByRole("option", { name: /more actions/i }));

    // Expanding reveals the actions and must NOT close the palette (it is not a
    // command submission).
    expect(screen.getByRole("option", { name: /open in lab/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /more actions/i })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("reveals a matching action directly when the query matches it", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    await user.keyboard("lab");
    expect(screen.getByRole("option", { name: /open in lab/i })).toBeInTheDocument();
    // A query drives action visibility, so the collapsed teaser does not appear.
    expect(screen.queryByRole("option", { name: /more actions/i })).not.toBeInTheDocument();
  });

  it("expands actions with Enter when the More actions row is focused", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    // 12 themes precede the shelf; arrow past them to the More actions row.
    for (let i = 0; i < 12; i += 1) {
      await user.keyboard("{ArrowDown}");
    }
    await user.keyboard("{Enter}");

    expect(screen.getByRole("option", { name: /open in lab/i })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders an action's keyboard shortcut as a key chip the user can learn", async () => {
    const user = userEvent.setup();
    const commands: PaletteCommand[] = [
      ...buildThemeCommands(vi.fn()),
      {
        id: "pin-to-compare",
        label: "Pin to compare",
        section: "Actions",
        keys: ["pin to compare", "compare"],
        shortcut: ".",
        run: vi.fn(),
      },
    ];
    render(<Host commands={commands} />);
    openPalette();

    await user.keyboard("pin");
    const option = screen.getByRole("option", { name: /pin to compare/i });
    const key = within(option).getByText(".");
    expect(key.tagName).toBe("KBD");
  });

  it("focuses a verb-matching action so Enter runs it, not an incidental theme", async () => {
    const user = userEvent.setup();
    const pinRun = vi.fn();
    const onSelectTheme = vi.fn();
    const commands: PaletteCommand[] = [
      ...buildThemeCommands(onSelectTheme),
      {
        id: "pin-to-compare",
        label: "Pin to compare",
        section: "Actions",
        keys: ["pin to compare", "compare"],
        shortcut: ".",
        run: pinRun,
      },
    ];
    render(<Host commands={commands} />);
    openPalette();

    // "pin" prefix-matches the action (tier 1) but only subsequence-matches the
    // Rosé Pine themes (tier 2), so Enter must run the action, not select a theme.
    await user.keyboard("pin");
    await user.keyboard("{Enter}");

    expect(pinRun).toHaveBeenCalledTimes(1);
    expect(onSelectTheme).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("runs an action command when clicked", async () => {
    const user = userEvent.setup();
    const actionRun = vi.fn();
    render(<Host commands={makeCommands(vi.fn(), actionRun)} />);
    openPalette();

    // The action lives behind a query (or the More actions row); reach it by typing.
    await user.keyboard("lab");
    await user.click(screen.getByRole("option", { name: /open in lab/i }));
    expect(actionRun).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
