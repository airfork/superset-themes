// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { SettingsScene } from "./SettingsScene";

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("SettingsScene", () => {
  it("renders a labeled text input", () => {
    render(<SettingsScene entry={entryFor("tokyo-night")} />);
    expect(screen.getByRole("textbox", { name: /display name/i })).toBeInTheDocument();
  });

  it("renders a labeled select", () => {
    render(<SettingsScene entry={entryFor("tokyo-night")} />);
    expect(screen.getByRole("combobox", { name: /default editor/i })).toBeInTheDocument();
  });

  it("renders a fieldset of checkboxes", () => {
    render(<SettingsScene entry={entryFor("tokyo-night")} />);
    const group = screen.getByRole("group", { name: /editor features/i });
    expect(group.tagName).toBe("FIELDSET");
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders a fieldset of radio buttons for theme mode", () => {
    render(<SettingsScene entry={entryFor("tokyo-night")} />);
    const group = screen.getByRole("radiogroup", { name: /theme mode/i });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /follow system/i })).toBeInTheDocument();
  });

  it("renders a destructive action button", () => {
    render(<SettingsScene entry={entryFor("tokyo-night")} />);
    expect(screen.getByRole("button", { name: /reset to defaults/i })).toBeInTheDocument();
  });

  it("asks for confirmation before applying the destructive reset", async () => {
    const user = userEvent.setup();
    render(<SettingsScene entry={entryFor("tokyo-night")} />);

    const reset = screen.getByRole("button", { name: /reset to defaults/i });
    await user.click(reset);

    // First click flips to a confirmation prompt rather than running the action.
    expect(screen.getByRole("button", { name: /click again to confirm/i })).toBeInTheDocument();

    // A polite live region echoes the prompt for assistive tech.
    expect(screen.getByText(/reset requires confirmation/i)).toBeInTheDocument();

    // Second click commits and announces completion.
    await user.click(screen.getByRole("button", { name: /click again to confirm/i }));
    expect(screen.getByRole("button", { name: /defaults restored/i })).toBeInTheDocument();
    expect(screen.getByText(/settings have been reset to defaults/i)).toBeInTheDocument();
  });

  it("renders a code-block sample using the editor font", () => {
    render(<SettingsScene entry={entryFor("tokyo-night")} />);
    expect(screen.getByLabelText(/code sample/i)).toBeInTheDocument();
  });

  it("renders a terminal sample with prompt output", () => {
    render(<SettingsScene entry={entryFor("tokyo-night")} />);
    expect(screen.getByLabelText(/terminal sample/i)).toBeInTheDocument();
  });
});
