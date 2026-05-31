// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ShortcutsOverlay } from "./ShortcutsOverlay";

describe("ShortcutsOverlay", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<ShortcutsOverlay open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a labeled modal dialog when open", () => {
    render(<ShortcutsOverlay open={true} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /keyboard shortcuts/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("lists the chrome's core shortcuts with their key chips", () => {
    render(<ShortcutsOverlay open={true} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /keyboard shortcuts/i });
    expect(dialog).toHaveTextContent(/pin the focused theme to compare/i);
    expect(dialog).toHaveTextContent(/search themes and actions/i);
    const keys = [...dialog.querySelectorAll("kbd")].map((key) => key.textContent);
    expect(keys).toEqual(expect.arrayContaining([".", "⌘", "K", "?", "Esc"]));
  });

  it("focuses the close button on open so the dialog is operable by keyboard", () => {
    render(<ShortcutsOverlay open={true} onClose={() => {}} />);
    expect(screen.getByRole("button", { name: /close keyboard shortcuts/i })).toHaveFocus();
  });

  it("closes via the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShortcutsOverlay open={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /close keyboard shortcuts/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShortcutsOverlay open={true} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when a pointer press lands outside the panel", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShortcutsOverlay open={true} onClose={onClose} />);
    await user.click(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
