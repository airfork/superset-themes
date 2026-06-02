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

  it("does not mark top-level Workspaces as active", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    const tree = screen.getByRole("navigation", { name: /workspaces/i });
    expect(within(tree).getByRole("link", { name: /^workspaces$/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("uses a fixed anonymized Superset-shaped fixture and marks only the nested thread active", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    expect(document.querySelector(".scene-workspace__team-name")?.textContent).toBe("John's Team");
    expect(
      Array.from(
        document.querySelectorAll(".scene-workspace__project-name"),
        (element) => element.textContent,
      ),
    ).toEqual(["inbox-pro", "linear-clone", "pulse-monitor", "storybook-lab"]);
    expect(
      Array.from(
        document.querySelectorAll(".scene-workspace__branch-name"),
        (element) => element.textContent,
      ),
    ).toEqual(["main"]);

    const activeThread = screen.getByText("main").closest("li");
    expect(activeThread).toHaveAttribute("data-active", "true");
    expect(document.querySelectorAll(".scene-workspace__branches li[data-active]")).toHaveLength(1);
  });

  it("renders the main column with session controls, agent controls, and a Run control", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    const main = screen.getByRole("region", { name: /workspace/i });
    expect(within(main).getByRole("button", { name: /^workspace setup$/i })).toBeInTheDocument();
    expect(within(main).getByRole("button", { name: /^claude$/i })).toBeInTheDocument();
    expect(within(main).getAllByRole("button", { name: /run/i }).length).toBeGreaterThan(0);
    const terminal = within(main).getByRole("log");
    expect(terminal).toHaveTextContent(/dispatcher\.backoff\(\)/);
    // Claude output is colored with terminal ANSI tokens, not a flat textarea.
    expect(terminal.querySelector(".scene-workspace__term-ok")).toBeInTheDocument();
    const output = terminal.querySelector(".scene-workspace__terminal-output");
    expect(output).toHaveAttribute("tabindex", "0");
    expect(output).toHaveAccessibleName("Terminal output");
  });

  it("does not render a file tree", () => {
    render(<WorkspaceScene entry={entryFor("tokyo-night")} />);

    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });
});
