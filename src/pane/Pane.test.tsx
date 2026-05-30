// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import { Pane } from "./Pane";

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("Pane", () => {
  it("renders the Workspace scene by default", () => {
    render(<Pane entry={entryFor("tokyo-night")} onPin={() => {}} />);
    expect(screen.getByRole("region", { name: /tokyo night workspace/i })).toBeInTheDocument();
  });

  it("dispatches the expand callback when the nameplate name is clicked", async () => {
    const user = userEvent.setup();
    const onExpandToggle = vi.fn();
    render(
      <Pane
        entry={entryFor("tokyo-night")}
        onPin={() => {}}
        expanded={false}
        onExpandToggle={onExpandToggle}
      />,
    );

    await user.click(screen.getByRole("button", { name: /expand tokyo night pane/i }));
    expect(onExpandToggle).toHaveBeenCalledTimes(1);
  });

  it("flips the nameplate's expand label and aria-expanded when expanded", () => {
    render(
      <Pane
        entry={entryFor("tokyo-night")}
        onPin={() => {}}
        expanded={true}
        onExpandToggle={() => {}}
      />,
    );

    const button = screen.getByRole("button", { name: /collapse tokyo night pane/i });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("dispatches the expand callback when the `f` key is pressed inside the pane", async () => {
    const user = userEvent.setup();
    const onExpandToggle = vi.fn();
    render(
      <Pane
        entry={entryFor("tokyo-night")}
        onPin={() => {}}
        expanded={false}
        onExpandToggle={onExpandToggle}
      />,
    );

    const region = screen.getByRole("region", { name: /tokyo night workspace/i });
    region.focus();
    await user.keyboard("f");

    expect(onExpandToggle).toHaveBeenCalledTimes(1);
  });
});
