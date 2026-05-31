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

  it("conveys the mode with an icon only, not redundant visible text", () => {
    render(<Nameplate entry={entryFor("tokyo-night")} onPin={() => {}} />);
    // The accessible label carries the mode; the glyph must not duplicate it as visible text.
    expect(screen.getByLabelText(/dark theme/i)).not.toHaveTextContent(/dark/i);
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

  it("omits the Pin to compare action when no onPin handler is provided", () => {
    // In compare slots the theme is already pinned, so the slot owns Unpin and the
    // nameplate must not also offer Pin to compare (two opposite verbs on one object).
    render(<Nameplate entry={entryFor("tokyo-night")} />);

    expect(screen.queryByRole("button", { name: /pin to compare/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open in lab/i })).toBeInTheDocument();
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

  it("surfaces a visible failure status when the clipboard write rejects", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("clipboard blocked"));
    const user = userEvent.setup();
    render(<Nameplate entry={entryFor("tokyo-night")} onPin={() => {}} />);

    await user.click(screen.getByRole("button", { name: /copy json/i }));
    expect(await screen.findByRole("button", { name: /copy failed/i })).toBeInTheDocument();
    writeText.mockRestore();
  });

  it("collapses action labels to icon tooltips in compact mode", () => {
    // Compare slots are narrow; full action labels starve the title of width and
    // force it to wrap. Compact actions go icon-only, exposing the label as a
    // title tooltip while the accessible name still comes from the hidden text.
    render(<Nameplate entry={entryFor("tokyo-night")} compact />);

    expect(screen.getByRole("link", { name: /open in lab/i })).toHaveAttribute(
      "title",
      "Open in Lab",
    );
    expect(screen.getByRole("button", { name: /copy json/i })).toHaveAttribute(
      "title",
      "Copy JSON",
    );
  });

  it("omits style tags in compact mode to keep the identity strip single-line", () => {
    // aurora-dark's wider tag set is what wraps the title in a narrow compare slot;
    // compact drops the tags (redundant beside the visible preview) but keeps the
    // core identity (name + family + mode).
    const entry = entryFor("aurora-dark");
    render(<Nameplate entry={entry} compact />);

    for (const tag of entry.meta.styleTags) {
      expect(screen.queryByText(tag)).not.toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: entry.theme.name })).toBeInTheDocument();
    expect(screen.getByText(entry.meta.family)).toBeInTheDocument();
    expect(screen.getByLabelText(/dark theme/i)).toBeInTheDocument();
  });

  it("keeps full action labels without tooltips in the default layout", () => {
    render(<Nameplate entry={entryFor("tokyo-night")} onPin={() => {}} />);

    expect(screen.getByRole("link", { name: /open in lab/i })).not.toHaveAttribute("title");
    expect(screen.getByRole("button", { name: /copy json/i })).not.toHaveAttribute("title");
  });

  it("nests the expand toggle inside the heading and reflects aria-expanded", () => {
    const entry = entryFor("tokyo-night");
    render(<Nameplate entry={entry} onPin={() => {}} expanded={false} onExpandToggle={() => {}} />);

    const heading = screen.getByRole("heading", { name: entry.theme.name });
    const button = screen.getByRole("button", { name: /expand tokyo night pane/i });
    expect(heading).toContainElement(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("flips the expand toggle label and aria-expanded when expanded is true", () => {
    const entry = entryFor("tokyo-night");
    render(<Nameplate entry={entry} onPin={() => {}} expanded={true} onExpandToggle={() => {}} />);

    const button = screen.getByRole("button", { name: /collapse tokyo night pane/i });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});
