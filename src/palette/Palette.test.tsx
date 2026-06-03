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

function Host({ commands, seedQuery }: { commands: PaletteCommand[]; seedQuery?: string }) {
  const { paletteProps } = usePalette(commands, { seedQuery });
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
    expect(screen.getByRole("option", { name: "Tokyo Night" })).toBeInTheDocument();
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

  it("seeds the query from the rail filter when ⌘K opens, carrying the typed text over", () => {
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} seedQuery="rose" />);
    openPalette();

    // The rail's empty-state hint sends users to ⌘K; the query they already typed
    // must arrive with them, pre-filtered, not get thrown away.
    expect(screen.getByRole("combobox")).toHaveValue("rose");
    expect(screen.getByRole("option", { name: /rosé pine dawn/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^nord$/i })).not.toBeInTheDocument();
  });

  it("opts the combobox out of browser autofill and spellcheck", () => {
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    const input = screen.getByRole("combobox", { name: /command palette search/i });

    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("name", "command-palette-search");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("folds diacritics so a plain-ASCII query surfaces an accented theme", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    // "rose pine" (no accent) must still reach "Rosé Pine Dawn"; the rail already
    // folds, and ⌘K is the canonical search surface, so it must not lag behind.
    await user.keyboard("rose pine");
    expect(screen.getByRole("option", { name: /rosé pine dawn/i })).toBeInTheDocument();
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

    // "dawn" uniquely matches Rosé Pine Dawn; "rose" now ties across the three
    // Rosé Pine variants, so the deterministic top match needs a sharper query.
    await user.keyboard("dawn");
    await user.keyboard("{Enter}");

    expect(onSelectTheme).toHaveBeenCalledWith("rose-pine-dawn");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("runs an exact theme-name match before a matching family", async () => {
    const user = userEvent.setup();
    const onSelectTheme = vi.fn();
    render(<Host commands={makeCommands(onSelectTheme, vi.fn())} />);
    openPalette();

    await user.keyboard("dracula");
    await user.keyboard("{Enter}");

    expect(onSelectTheme).toHaveBeenCalledWith("dracula");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows action commands directly before themes at rest like Superset's palette", () => {
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    expect(screen.getByRole("option", { name: /open in lab/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /more actions/i })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Tokyo Night" })).toBeInTheDocument();

    expect(within(screen.getByRole("group", { name: "Themes" })).getByText("Family")).toBeVisible();

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAccessibleName(/open in lab/i);
    expect(options[1]).toHaveAccessibleName(/superset light/i);
  });

  it("reveals a matching action directly when the query matches it", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    await user.keyboard("lab");
    expect(screen.getByRole("option", { name: /open in lab/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /more actions/i })).not.toBeInTheDocument();
  });

  it("renders an action's keyboard shortcut as a key chip the user can learn", async () => {
    const user = userEvent.setup();
    const commands: PaletteCommand[] = [
      ...buildThemeCommands(vi.fn()),
      {
        id: "keyboard-shortcuts",
        label: "Keyboard shortcuts",
        section: "Actions",
        keys: ["keyboard shortcuts", "help"],
        shortcut: "?",
        run: vi.fn(),
      },
    ];
    render(<Host commands={commands} />);
    openPalette();

    await user.keyboard("shortcuts");
    const option = screen.getByRole("option", { name: /keyboard shortcuts/i });
    const key = within(option).getByText("?");
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

    // Reach the action by intent text, matching keyboard-first command use.
    await user.keyboard("lab");
    await user.click(screen.getByRole("option", { name: /open in lab/i }));
    expect(actionRun).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("offers a recovery hint, not just a dead-end, when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Host commands={makeCommands(vi.fn(), vi.fn())} />);
    openPalette();

    await user.keyboard("zzzzz");

    const empty = screen.getByRole("status");
    // The bare "No matches" line leaves the user stuck; like the rail's empty state,
    // the palette must suggest what to try next.
    expect(empty).toHaveTextContent(/no matches/i);
    expect(empty).toHaveTextContent(/try a theme name, family, or action/i);
  });
});
