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
