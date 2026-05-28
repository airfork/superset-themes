// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import { exportThemeJson } from "../theme-core/exportTheme";
import { Nameplate } from "./Nameplate";

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("Nameplate", () => {
  it("renders theme name, family chip, tag chips, and a light/dark indicator", () => {
    // Pick an entry where theme.name and meta.family differ so we can assert each independently.
    const entry = entryFor("rose-pine-dawn");
    render(<Nameplate entry={entry} onPin={() => {}} />);

    expect(screen.getByRole("heading", { name: entry.theme.name })).toBeInTheDocument();
    expect(screen.getByText(entry.meta.family)).toBeInTheDocument();
    for (const tag of entry.meta.styleTags) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/light theme/i)).toBeInTheDocument();
  });

  it("renders a dark indicator for dark themes", () => {
    render(<Nameplate entry={entryFor("tokyo-night")} onPin={() => {}} />);
    expect(screen.getByLabelText(/dark theme/i)).toBeInTheDocument();
  });

  it("renders Pin to compare, Open in Lab, and Copy JSON actions", () => {
    render(<Nameplate entry={entryFor("tokyo-night")} onPin={() => {}} />);

    expect(screen.getByRole("button", { name: /pin to compare/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open in lab/i })).toHaveAttribute(
      "href",
      "/lab?from=tokyo-night",
    );
    expect(screen.getByRole("button", { name: /copy json/i })).toBeInTheDocument();
  });

  it("calls onPin with the focused theme id when Pin to compare is activated", async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();
    render(<Nameplate entry={entryFor("tokyo-night")} onPin={onPin} />);

    await user.click(screen.getByRole("button", { name: /pin to compare/i }));
    expect(onPin).toHaveBeenCalledTimes(1);
    expect(onPin).toHaveBeenCalledWith("tokyo-night");
  });

  it("copies the exported theme JSON to the clipboard when Copy JSON is activated", async () => {
    // jsdom now provides a real navigator.clipboard with a non-configurable
    // writeText; spy on it rather than redefining the property.
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const entry = entryFor("rose-pine-dawn");
    const user = userEvent.setup();
    render(<Nameplate entry={entry} onPin={() => {}} />);

    await user.click(screen.getByRole("button", { name: /copy json/i }));
    expect(writeText).toHaveBeenCalledWith(exportThemeJson(entry));
    writeText.mockRestore();
  });
});
