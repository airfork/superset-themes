import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { getThemeById } from "../data/fixtures";
import { PreviewFrame } from "./PreviewFrame";
import { PREVIEW_TAB_LABELS, PreviewTabs } from "./PreviewTabs";

const theme = getThemeById("aurora-dark");

if (!theme) {
  throw new Error("Expected aurora-dark fixture to exist.");
}

describe("PreviewTabs", () => {
  it("renders Superset preview tabs with accessible selected state", () => {
    render(<PreviewTabs theme={theme} />);

    const tablist = screen.getByRole("tablist", { name: /preview surfaces/i });
    const tabs = within(tablist).getAllByRole("tab");

    expect(tabs.map((tab) => tab.textContent)).toEqual(PREVIEW_TAB_LABELS);
    expect(screen.getByRole("tab", { name: "Workspace" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Workspace" })).toHaveTextContent(
      /apps\/desktop\/src\/shared\/themes\/types\.ts/i,
    );
  });

  it("switches surfaces by click", async () => {
    const user = userEvent.setup();
    render(<PreviewTabs theme={theme} />);

    for (const label of PREVIEW_TAB_LABELS) {
      await user.click(screen.getByRole("tab", { name: label }));

      expect(screen.getByRole("tab", { name: label })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tabpanel", { name: label })).toBeVisible();
    }

    expect(screen.getByRole("tabpanel", { name: "Settings/Form" })).toHaveTextContent(
      /import theme/i,
    );
  });

  it("supports arrow key tab navigation", async () => {
    const user = userEvent.setup();
    render(<PreviewTabs theme={theme} />);

    const workspaceTab = screen.getByRole("tab", { name: "Workspace" });
    workspaceTab.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Editor" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Editor" })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Settings/Form" })).toHaveFocus();
    expect(screen.getByRole("tabpanel", { name: "Settings/Form" })).toBeVisible();
  });
});

describe("PreviewFrame", () => {
  it("applies selected theme CSS variables to its frame", () => {
    render(
      <PreviewFrame theme={theme}>
        <div>Preview content</div>
      </PreviewFrame>,
    );

    const frame = screen.getByRole("group", { name: /aurora dark preview/i });

    expect(frame).toHaveStyle(`--preview-ui-background: ${theme.ui.background}`);
    expect(frame).toHaveStyle(`--preview-terminal-background: ${theme.terminal.background}`);
  });
});
