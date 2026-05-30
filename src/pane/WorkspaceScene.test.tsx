// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { WorkspaceScene } from "./WorkspaceScene";

function entryFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("WorkspaceScene", () => {
  it("renders the workspaces tree on the left", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    const tree = screen.getByRole("navigation", { name: /workspaces/i });
    expect(within(tree).getByText(/workspaces/i)).toBeInTheDocument();
    expect(within(tree).getByText(/automations/i)).toBeInTheDocument();
    expect(within(tree).getByText(/tasks & prs/i)).toBeInTheDocument();
  });

  it("renders the main column with session tabs, agent tabs, and a Run control", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    const main = screen.getByRole("region", { name: /workspace/i });
    expect(within(main).getByRole("tablist", { name: /open sessions/i })).toBeInTheDocument();
    expect(within(main).getByRole("tablist", { name: /agent picker/i })).toBeInTheDocument();
    expect(within(main).getAllByRole("button", { name: /run/i }).length).toBeGreaterThan(0);
  });

  it("does not render a file tree", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });
});
