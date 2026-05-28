// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RailSearch } from "./RailSearch";

describe("RailSearch", () => {
  it("calls onOpenPalette on click", async () => {
    const user = userEvent.setup();
    const onOpenPalette = vi.fn();
    render(<RailSearch onOpenPalette={onOpenPalette} />);

    await user.click(screen.getByRole("button", { name: /search themes/i }));
    expect(onOpenPalette).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenPalette when '/' is pressed while focused", async () => {
    const user = userEvent.setup();
    const onOpenPalette = vi.fn();
    render(<RailSearch onOpenPalette={onOpenPalette} />);

    const trigger = screen.getByRole("button", { name: /search themes/i });
    trigger.focus();
    await user.keyboard("/");
    expect(onOpenPalette).toHaveBeenCalledTimes(1);
  });

  it("ignores other keypresses", async () => {
    const user = userEvent.setup();
    const onOpenPalette = vi.fn();
    render(<RailSearch onOpenPalette={onOpenPalette} />);

    const trigger = screen.getByRole("button", { name: /search themes/i });
    trigger.focus();
    await user.keyboard("a");
    expect(onOpenPalette).not.toHaveBeenCalled();
  });
});
