// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("formats the contrast ratio to one decimal", () => {
    render(<BottomBar entry={entry("catppuccin-mocha")} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toMatch(/[0-9]+\.[0-9]:1/);
  });

  describe("compare variant", () => {
    it("renders both pinned slots' names and their own contrast ratios", () => {
      render(<BottomBar variant="compare" a={entry("tokyo-night")} b={entry("solarized-light")} />);

      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveTextContent("Tokyo Night");
      expect(footer).toHaveTextContent("Solarized Light");
      const ratios = footer.textContent?.match(/\d+\.\d:1/g) ?? [];
      expect(ratios).toHaveLength(2);
    });

    it("replaces catalog-only hints with compare hints", () => {
      render(<BottomBar variant="compare" a={entry("tokyo-night")} b={entry("solarized-light")} />);

      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveTextContent("⌘K");
      expect(footer).toHaveTextContent(/esc/i);
      expect(footer).not.toHaveTextContent(". pin");
      expect(footer).not.toHaveTextContent("↓ next");
    });

    it("drops the redundant pointer hint so the footer cluster is pure key chips", () => {
      render(<BottomBar variant="compare" a={entry("tokyo-night")} b={entry("solarized-light")} />);

      const footer = screen.getByRole("contentinfo");
      // Clicking to pin is already taught by the rail hint and the live status
      // line, so the footer stays a pure keyboard-shortcut legend like the catalog.
      expect(footer).not.toHaveTextContent(/click to pin/i);
      const keys = [...footer.querySelectorAll("kbd")].map((key) => key.textContent);
      expect(keys).toEqual(["⌘K", "Esc"]);
    });

    it("trails the Esc chip with a terse verb matching the catalog grammar", () => {
      render(<BottomBar variant="compare" a={entry("tokyo-night")} b={entry("solarized-light")} />);

      const footer = screen.getByRole("contentinfo");
      // Catalog hints read "↓ next" / ". pin"; compare should read "Esc exit",
      // not the wordier "Esc to exit".
      expect(footer).toHaveTextContent("Esc exit");
      expect(footer).not.toHaveTextContent(/esc to exit/i);
    });

    it("labels an empty slot instead of borrowing another theme's facts", () => {
      render(<BottomBar variant="compare" a={entry("tokyo-night")} />);

      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveTextContent("Tokyo Night");
      expect(footer).toHaveTextContent(/empty/i);
      const ratios = footer.textContent?.match(/\d+\.\d:1/g) ?? [];
      expect(ratios).toHaveLength(1);
    });
  });
});
