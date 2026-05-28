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

  it("renders the thread on the middle column with a branch header, agent tabs, and an input", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    const thread = screen.getByRole("region", { name: /thread/i });
    expect(within(thread).getByText(/feat\/x/i)).toBeInTheDocument();
    expect(within(thread).getByRole("tablist", { name: /agent/i })).toBeInTheDocument();
    expect(within(thread).getByRole("textbox", { name: /message/i })).toBeInTheDocument();
  });

  it("collapses the right column to a single toggle without rendering a file tree", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    expect(
      screen.getByRole("button", { name: /open right panel|expand right/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });
});
