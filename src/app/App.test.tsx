import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("pins a detail theme into compare", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/themes/aurora-dark");

    render(<App />);

    await user.click(await screen.findByRole("button", { name: /pin dark/i }));

    expect(await screen.findByRole("region", { name: /dark theme slot/i })).toHaveTextContent(
      /aurora dark/i,
    );
  });

  it("renders compare routes with paired URL state", async () => {
    window.history.replaceState(
      null,
      "",
      "/compare?light=aurora-light&dark=aurora-dark&tab=terminal",
    );

    render(<App />);

    expect(
      await screen.findByRole("region", { name: /light and dark pairing/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /light theme slot/i })).toHaveTextContent(
      /aurora light/i,
    );
    expect(screen.getByRole("region", { name: /dark theme slot/i })).toHaveTextContent(
      /aurora dark/i,
    );
  });

  it("renders lab routes from catalog theme search params", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/lab?from=aurora-dark");

    render(<App />);

    expect(await screen.findByRole("region", { name: /theme lab/i })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /lab controls/i })).toHaveTextContent(
      /aurora dark/i,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: /start from catalog theme/i }),
      "graphite-dark",
    );

    expect(screen.getByRole("complementary", { name: /lab controls/i })).toHaveTextContent(
      /graphite dark/i,
    );
  });
});
