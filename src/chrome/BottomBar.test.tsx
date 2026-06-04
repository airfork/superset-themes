// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import { BottomBar } from "./BottomBar";

function entry(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("BottomBar", () => {
  it("renders theme name, family, and contrast ratio in a status footer", () => {
    render(<BottomBar entry={entry("tokyo-night")} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent("Tokyo Night");
    expect(footer).toHaveTextContent("Tokyo Night");
    expect(footer.textContent).toMatch(/\d+\.\d:1/);
  });

  it("renders the keyboard hint cluster", () => {
    render(<BottomBar entry={entry("solarized-light")} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent("↓ next");
    expect(footer).toHaveTextContent("⌘K");
    expect(footer).toHaveTextContent(". pin");
  });

  it("marks the keyboard keys as kbd chips so they read as pressable", () => {
    render(<BottomBar entry={entry("solarized-light")} />);

    const footer = screen.getByRole("contentinfo");
    const keys = [...footer.querySelectorAll("kbd")].map((key) => key.textContent);
    expect(keys).toEqual(["↓", "⌘K", "."]);
  });

  it("offers a shortcuts trigger when a handler is provided, firing it on click", async () => {
    const user = userEvent.setup();
    const onShowShortcuts = vi.fn();
    render(<BottomBar entry={entry("solarized-light")} onShowShortcuts={onShowShortcuts} />);

    const trigger = screen.getByRole("button", { name: /keyboard shortcuts/i });
    expect(trigger).toHaveTextContent("?");
    await user.click(trigger);
    expect(onShowShortcuts).toHaveBeenCalledTimes(1);
  });

  it("omits the shortcuts trigger when no handler is provided", () => {
    render(<BottomBar entry={entry("solarized-light")} />);
    expect(screen.queryByRole("button", { name: /keyboard shortcuts/i })).not.toBeInTheDocument();
  });

  it("formats the contrast ratio to one decimal", () => {
    render(<BottomBar entry={entry("catppuccin-mocha")} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toMatch(/[0-9]+\.[0-9]:1/);
  });

  it("collapses the family segment when it merely repeats the theme name", () => {
    // Tokyo Night's family is literally "Tokyo Night"; showing it twice
    // ("Tokyo Night · Tokyo Night · 8.1:1") reads as a glitch, so the family
    // chip drops out and only the name remains.
    const tokyo = entry("tokyo-night");
    expect(tokyo.meta.family).toBe(tokyo.theme.name);
    render(<BottomBar entry={tokyo} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.querySelector(".chrome-bottombar__family")).toBeNull();
    expect(footer.querySelector(".chrome-bottombar__name")).toHaveTextContent("Tokyo Night");
  });

  it("keeps the family segment when it differs from the theme name", () => {
    const cat = entry("catppuccin-mocha");
    expect(cat.meta.family).not.toBe(cat.theme.name);
    render(<BottomBar entry={cat} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.querySelector(".chrome-bottombar__family")).toHaveTextContent("Catppuccin");
  });

  describe("compare variant", () => {
    it("renders both pinned slots' names and their own contrast ratios", () => {
      render(
        <BottomBar
          variant="compare"
          baseline={entry("tokyo-night")}
          candidate={entry("solarized-light")}
        />,
      );

      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveTextContent("Tokyo Night");
      expect(footer).toHaveTextContent("Solarized Light");
      const ratios = footer.textContent?.match(/\d+\.\d:1/g) ?? [];
      expect(ratios).toHaveLength(2);
    });

    it("replaces catalog-only hints with compare hints", () => {
      render(
        <BottomBar
          variant="compare"
          baseline={entry("tokyo-night")}
          candidate={entry("solarized-light")}
        />,
      );

      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveTextContent("⌘K");
      expect(footer).toHaveTextContent(/esc/i);
      expect(footer).not.toHaveTextContent(". pin");
      expect(footer).not.toHaveTextContent("↓ next");
    });

    it("drops the redundant pointer hint so the footer cluster is pure key chips", () => {
      render(
        <BottomBar
          variant="compare"
          baseline={entry("tokyo-night")}
          candidate={entry("solarized-light")}
        />,
      );

      const footer = screen.getByRole("contentinfo");
      // Clicking to pin is already taught by the rail hint and the live status
      // line, so the footer stays a pure keyboard-shortcut legend like the catalog.
      expect(footer).not.toHaveTextContent(/click to pin/i);
      const keys = [...footer.querySelectorAll("kbd")].map((key) => key.textContent);
      expect(keys).toEqual(["⌘K", "Esc"]);
    });

    it("trails the Esc chip with a terse verb matching the catalog grammar", () => {
      render(
        <BottomBar
          variant="compare"
          baseline={entry("tokyo-night")}
          candidate={entry("solarized-light")}
        />,
      );

      const footer = screen.getByRole("contentinfo");
      // Catalog hints read "↓ next" / ". pin"; compare should read "Esc exit",
      // not the wordier "Esc to exit".
      expect(footer).toHaveTextContent("Esc exit");
      expect(footer).not.toHaveTextContent(/esc to exit/i);
    });

    it("labels an empty slot instead of borrowing another theme's facts", () => {
      render(<BottomBar variant="compare" baseline={entry("tokyo-night")} />);

      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveTextContent("Tokyo Night");
      expect(footer).toHaveTextContent(/empty/i);
      const ratios = footer.textContent?.match(/\d+\.\d:1/g) ?? [];
      expect(ratios).toHaveLength(1);
    });
  });
});
