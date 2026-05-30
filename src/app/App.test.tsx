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
  it("renders the master/detail shell on the catalog route", async () => {
    render(<App />);

    expect(await screen.findByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /themes/i })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/Tokyo Night/);
  });

  it("hydrates the focused theme from the ?theme= search param", async () => {
    window.history.replaceState(null, "", "/?theme=solarized-light");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /solarized light/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/Solarized Light/);
  });

  it("renders compare mode with the two pinned slots in the bottom bar", async () => {
    window.history.replaceState(
      null,
      "",
      "/compare?a=aurora-light&b=aurora-dark&from=graphite-dark&scene=workspace",
    );

    render(<App />);

    expect(
      await screen.findByRole("region", { name: /compare slot a: aurora light/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /compare slot b: aurora dark/i }),
    ).toBeInTheDocument();
    // The bottom bar reflects the two compared slots, not the entry-state theme.
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(/aurora light/i);
    expect(footer).toHaveTextContent(/aurora dark/i);
    expect(footer).not.toHaveTextContent(/graphite dark/i);
  });

  it("renders the lab on the shared shell from catalog theme search params", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/lab?from=aurora-dark");

    render(<App />);

    // Wait on the lab-only source select so the assertion can't latch onto a
    // transient catalog tree the router renders mid-navigation.
    const select = await screen.findByRole("combobox", { name: /start from catalog theme/i });
    expect(select).toHaveValue("aurora-dark");

    // Lab shares the catalog shell: a Themes rail plus the focused-theme bottom bar.
    expect(screen.getByRole("complementary", { name: /themes/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/aurora dark/i);

    await user.selectOptions(select, "graphite-dark");

    // Reseeding remounts the lab with the new draft, morphing the chrome.
    expect(await screen.findByRole("heading", { name: /graphite dark/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(/graphite dark/i);
  });
});
