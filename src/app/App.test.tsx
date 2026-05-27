import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

beforeAll(() => {
  window.scrollTo = vi.fn();
});

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("App", () => {
  it("renders the catalog browsing workspace", async () => {
    render(<App />);

    expect(await screen.findByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /theme catalog/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /aurora light/i })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /graphite dark/i })).toBeInTheDocument();
  });

  it("hydrates catalog filters from search params", async () => {
    window.history.replaceState(null, "", "/?q=graphite&type=dark&sort=accentHue");

    render(<App />);

    expect(await screen.findByRole("searchbox", { name: /search themes/i })).toHaveValue(
      "graphite",
    );
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Sort" })).toHaveValue("accentHue");
    expect(screen.getByRole("article", { name: /graphite dark/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /aurora dark/i })).not.toBeInTheDocument();
  });

  it("renders theme detail routes", async () => {
    window.history.replaceState(null, "", "/themes/aurora-dark");

    render(<App />);

    expect(await screen.findByRole("region", { name: /aurora dark details/i })).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: /preview surfaces/i })).toBeInTheDocument();
  });
});
