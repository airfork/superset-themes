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
