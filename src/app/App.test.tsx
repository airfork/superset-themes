import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { App } from "./App";

beforeAll(() => {
  window.scrollTo = vi.fn();
});

describe("App", () => {
  it("renders an accessible catalog shell", async () => {
    render(<App />);

    expect(await screen.findByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /theme catalog workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/task 1 scaffold/i)).toBeInTheDocument();
  });
});
