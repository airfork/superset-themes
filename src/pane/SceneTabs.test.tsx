// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SceneTabs } from "./SceneTabs";

describe("SceneTabs", () => {
  it("activates the next tab on ArrowRight and wraps at the end", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SceneTabs current="workspace" onChange={onChange} />);

    const workspace = screen.getByRole("tab", { name: /workspace/i });
    workspace.focus();
    await user.keyboard("{ArrowRight}");

    expect(onChange).toHaveBeenLastCalledWith("settings");
  });

  it("activates the previous tab on ArrowLeft and wraps at the start", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SceneTabs current="workspace" onChange={onChange} />);

    const workspace = screen.getByRole("tab", { name: /workspace/i });
    workspace.focus();
    await user.keyboard("{ArrowLeft}");

    expect(onChange).toHaveBeenLastCalledWith("settings");
  });

  it("jumps to the first tab on Home and the last on End", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SceneTabs current="settings" onChange={onChange} />);

    const settings = screen.getByRole("tab", { name: /settings/i });
    settings.focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith("workspace");

    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("settings");
  });

  it("keeps the active tab as the only tab-stop (roving tabindex)", () => {
    render(<SceneTabs current="workspace" onChange={() => {}} />);

    const workspace = screen.getByRole("tab", { name: /workspace/i });
    const settings = screen.getByRole("tab", { name: /settings/i });
    expect(workspace).toHaveAttribute("tabindex", "0");
    expect(settings).toHaveAttribute("tabindex", "-1");
  });
});
