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
});
