// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("renders site name, search trigger, and GitHub repo link", () => {
    render(<TopBar onOpenPalette={() => {}} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Superset Themes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search themes/i })).toBeInTheDocument();
    expect(screen.getByText(/⌘K/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/superset-sh/superset-themes",
    );
  });

  it("calls onOpenPalette when the search trigger is activated", async () => {
    const user = userEvent.setup();
    const onOpenPalette = vi.fn();
    render(<TopBar onOpenPalette={onOpenPalette} />);

    await user.click(screen.getByRole("button", { name: /search themes/i }));
    expect(onOpenPalette).toHaveBeenCalledTimes(1);
  });
});
